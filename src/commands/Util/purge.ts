import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, PermissionFlagsBits, TextChannel, NewsChannel, ThreadChannel, User, Role } from 'discord.js';
import { Duration } from '@sapphire/time-utilities';

type AllowedChannel = TextChannel | NewsChannel | ThreadChannel;

interface PurgeOptions {
	channel: AllowedChannel;
	amount: number;
	user: User | null;
	role: Role | null;
	bots: boolean | null;
	filter: string | null;
	timeframe: string | null;
	commandMessage?: Message;
}

@ApplyOptions<Command.Options>({
	description: 'Manually purge messages matching specific criteria',
	requiredUserPermissions: [PermissionFlagsBits.ManageMessages],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	flags: ['bots'],
	options: ['filter', 'timeframe', 'user', 'role']
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.addIntegerOption((option) =>
			option.setName('amount').setDescription('Number of messages to scan (1-1000)').setRequired(true).setMinValue(1).setMaxValue(1000)
		)
		.addUserOption((option) => option.setName('user').setDescription('Purge messages by a specific user'))
		.addRoleOption((option) => option.setName('role').setDescription('Purge messages from users with this role'))
		.addBooleanOption((option) => option.setName('bots').setDescription('Purge messages sent by bots'))
		.addStringOption((option) => option.setName('filter').setDescription('Purge messages matching a keyword or regex'))
		.addStringOption((option) => option.setName('timeframe').setDescription('Time window (e.g., 10m, 2h, 1d) to search for messages to delete'))
)
export class PurgeCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const channel = interaction.channel;
		if (!channel || channel.isDMBased()) {
			await interaction.editReply('This command can only be used in a server channel.');
			return;
		}

		const result = await this.purgeMessages({
			channel: channel as TextChannel,
			amount: interaction.options.getInteger('amount', true),
			user: interaction.options.getUser('user'),
			role: interaction.options.getRole('role') as Role | null,
			bots: interaction.options.getBoolean('bots'),
			filter: interaction.options.getString('filter'),
			timeframe: interaction.options.getString('timeframe')
		});
		return await interaction.editReply(result);
	}

	public override async messageRun(message: Message, args: Args) {
		if (args.finished) {
			return await reply(
				message,
				'Please provide the number of messages to scan.\nUsage: `purge <amount> [--user=@user] [--role=@role] [--bots] [--filter="regex"] [--timeframe="10m"]`'
			);
		}
		const amount = await args.pick('integer').catch(() => 0);
		if (amount < 1 || amount > 1000) return await reply(message, 'Amount must be between 1 and 1000.');

		const channel = message.channel;
		if (channel.isDMBased()) return await reply(message, 'This command can only be used in a server channel.');

		let user: User | null = null;
		let role: Role | null = null;

		try {
			user = await args.pick('user');
		} catch {}
		try {
			role = await args.pick('role');
		} catch {}

		const result = await this.purgeMessages({
			channel: channel as TextChannel,
			amount,
			user,
			role,
			bots: args.getFlags('bots') ? true : null,
			filter: args.getOption('filter'),
			timeframe: args.getOption('timeframe'),
			commandMessage: message
		});

		if (message.deletable) {
			await message.delete().catch(() => null);
		}

		const replyMsg = await channel.send(result);
		return setTimeout(() => replyMsg.delete().catch(() => null), 4000) as any;
	}

	private async fetchMessagesToScan(channel: AllowedChannel, amount: number, initialBeforeId?: string): Promise<Message[]> {
		let fetchedMessages: Message[] = [];
		let lastMessageId: string | undefined = initialBeforeId;
		let remainingToFetch = amount;

		while (remainingToFetch > 0) {
			const fetchLimit = Math.min(remainingToFetch, 100);
			const fetchChunk: any = await (channel as TextChannel).messages.fetch({ limit: fetchLimit, before: lastMessageId });

			if (fetchChunk.size === 0) break;

			fetchedMessages.push(...fetchChunk.values());
			lastMessageId = fetchChunk.last()?.id;
			remainingToFetch -= fetchChunk.size;
		}
		return fetchedMessages;
	}

	private shouldDeleteMessage(
		msg: Message,
		user: User | null,
		timeLimit: number | null,
		bots: boolean | null,
		role: Role | null,
		filterRegex: RegExp | null
	): boolean {
		if (user && msg.author.id !== user.id) return false;
		if (timeLimit && msg.createdTimestamp < timeLimit) return false;
		if (bots !== null && msg.author.bot !== bots) return false;
		if (role && !msg.member?.roles.cache.has(role.id)) return false;
		if (filterRegex && !filterRegex.test(msg.content)) return false;
		return true;
	}

	private async executeBulkDelete(channel: AllowedChannel, toDelete: Message[]): Promise<string> {
		let totalDeleted = 0;
		const totalRequested = toDelete.length;

		for (let i = 0; i < totalRequested; i += 100) {
			const deleteChunk = toDelete.slice(i, i + 100);
			const deleted = await channel.bulkDelete(deleteChunk, true);
			totalDeleted += deleted.size;

			if (i + 100 < totalRequested) {
				await new Promise((resolve) => setTimeout(resolve, 1500));
			}
		}

		let replyText = `Successfully purged ${totalDeleted} messages.`;
		if (totalDeleted < totalRequested) {
			replyText += `\n-# Note: ${totalRequested - totalDeleted} messages were older than 14 days and could not be bulk deleted.`;
		}

		return replyText;
	}

	private async purgeMessages(opts: PurgeOptions): Promise<string> {
		const { channel, amount, user, role, bots, filter, timeframe, commandMessage } = opts;

		try {
			let timeLimit: number | null = null;
			if (timeframe) {
				try {
					const parsed = new Duration(timeframe).offset;
					if (!Number.isNaN(parsed) && parsed > 0) {
						timeLimit = Date.now() - parsed;
					} else {
						return 'Invalid timeframe format. Use things like "15m", "2h", "1d".';
					}
				} catch {
					return 'Invalid timeframe format.';
				}
			}

			let regex: RegExp | null = null;
			if (filter) {
				try {
					regex = new RegExp(filter, 'i');
				} catch {
					return `Invalid regex pattern: \`${filter}\``;
				}
			}

			const fetchedMessages = await this.fetchMessagesToScan(channel, amount, commandMessage?.id);
			const toDelete = fetchedMessages.filter((msg) => this.shouldDeleteMessage(msg, user, timeLimit, bots, role, regex));

			if (toDelete.length === 0) {
				return 'Found no messages matching the given criteria.';
			}

			return await this.executeBulkDelete(channel, toDelete);
		} catch (error) {
			console.error('Error purging messages:', error);
			return 'An error occurred while trying to purge messages. Please ensure I have the necessary permissions and try again.';
		}
	}
}
