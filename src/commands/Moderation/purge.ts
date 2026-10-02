import { ApplyOptions, RegisterChatInputCommand, RegisterUserContextMenuCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Duration } from '@sapphire/time-utilities';
import { EmbedBuilder, type GuildTextBasedChannel, type Message, MessageFlags, PermissionFlagsBits, type Role, type User } from 'discord.js';
import { availability, colors } from '#lib/constants';

const BULK_DELETE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;
const MAX_AMOUNT = 1000;
const MAX_SCAN_PER_CHANNEL = 10_000;
const CONTEXT_MENU_AMOUNT = 100;
const RESULT_LIFETIME = 7000;
const USAGE = '`purge <count> [user|role|bots] [--local|--global] [--filter=<regex>] [--timeframe=<10m>] [--silent]`';

const plural = (count: number) => (count === 1 ? '' : 's');

interface PurgeRequest {
	amount: number;
	user?: User | null;
	role?: Role | null;
	bots?: boolean;
	filter?: string | null;
	timeframe?: string | null;
	scope?: 'local' | 'global' | null;
	excludeId?: string;
}

interface PurgeResult {
	deleted: number;
	oldSkipped: number;
	channels: number;
}

@ApplyOptions<Command.Options>({
	description: 'Bulk-delete messages across the server, optionally filtered by user, role, bots, keyword or time.',
	requiredUserPermissions: [PermissionFlagsBits.ManageMessages],
	requiredClientPermissions: [PermissionFlagsBits.ManageMessages],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	preconditions: ['OwnerOnly'], // TODO owner only as still wip
	flags: ['l', 'local', 'g', 'global', 'bots', 's', 'silent'],
	options: ['filter', 'timeframe']
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...availability.guildOnly.contexts)
		.setIntegrationTypes(...availability.guildOnly.integrationTypes)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option.setName('count').setDescription('How many messages to delete (1-1000)').setRequired(true).setMinValue(1).setMaxValue(MAX_AMOUNT)
		)
		.addUserOption((option) => option.setName('user').setDescription('Only delete messages from this user'))
		.addRoleOption((option) => option.setName('role').setDescription('Only delete messages from members with this role'))
		.addBooleanOption((option) => option.setName('bots').setDescription('Only delete messages sent by bots'))
		.addStringOption((option) => option.setName('filter').setDescription('Only delete messages matching this keyword or regex'))
		.addStringOption((option) => option.setName('timeframe').setDescription('Only delete messages newer than this (e.g. 10m, 2h, 1d)'))
		.addStringOption((option) =>
			option
				.setName('scope')
				.setDescription('Where to purge (defaults to this channel when unfiltered, the whole server when filtered)')
				.addChoices({ name: 'This channel only', value: 'local' }, { name: 'Whole server', value: 'global' })
		)
)
@RegisterUserContextMenuCommand((builder) =>
	builder
		.setName('Purge messages')
		.setContexts(...availability.guildOnly.contexts)
		.setIntegrationTypes(...availability.guildOnly.integrationTypes)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = await this.purge(interaction.channel as GuildTextBasedChannel | null, {
			amount: interaction.options.getInteger('count', true),
			user: interaction.options.getUser('user'),
			role: interaction.options.getRole('role') as Role | null,
			bots: interaction.options.getBoolean('bots') ?? false,
			filter: interaction.options.getString('filter'),
			timeframe: interaction.options.getString('timeframe'),
			scope: interaction.options.getString('scope') as PurgeRequest['scope']
		});

		return interaction.editReply({ embeds: [embed] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const amount = await args.pick('integer').catch(() => null);
		if (amount === null || amount < 1 || amount > MAX_AMOUNT) {
			return reply(msg, `Tell me how many messages to delete, between 1 and ${MAX_AMOUNT}.\nUsage: ${USAGE}`);
		}

		const silent = args.getFlags('s', 'silent');
		const embed = await this.purge(msg.channel as GuildTextBasedChannel, {
			amount,
			...(await this.pickTarget(args)),
			filter: args.getOption('filter'),
			timeframe: args.getOption('timeframe'),
			scope: this.pickScope(args),
			excludeId: msg.id
		});

		if (msg.deletable) await msg.delete().catch(() => null);
		if (silent) return null;

		const sent = await (msg.channel as GuildTextBasedChannel).send({ embeds: [embed] }).catch(() => null);
		if (sent) setTimeout(() => sent.delete().catch(() => null), RESULT_LIFETIME);
		return sent;
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		if (!interaction.isUserContextMenuCommand()) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = await this.purge(interaction.channel as GuildTextBasedChannel | null, {
			amount: CONTEXT_MENU_AMOUNT,
			user: interaction.targetUser
		});

		return interaction.editReply({ embeds: [embed] });
	}

	private async pickTarget(args: Args): Promise<Pick<PurgeRequest, 'user' | 'role' | 'bots'>> {
		const bots = args.getFlags('bots');

		const user = await args.pick('userName').catch(() => null);
		if (user) return { user, bots };

		const role = await args.pick('role').catch(() => null);
		if (role) return { role, bots };

		const word = await args.pick('string').catch(() => null);
		return { bots: bots || word?.toLowerCase() === 'bots' };
	}

	private pickScope(args: Args): PurgeRequest['scope'] {
		if (args.getFlags('l', 'local')) return 'local';
		if (args.getFlags('g', 'global')) return 'global';
		return null;
	}

	private async purge(source: GuildTextBasedChannel | null, request: PurgeRequest): Promise<EmbedBuilder> {
		if (!source?.guild) return this.errorEmbed('This command can only be used in a server.');

		let regex: RegExp | null = null;
		if (request.filter) {
			try {
				regex = new RegExp(request.filter, 'i');
			} catch {
				return this.errorEmbed(`\`${request.filter}\` is not a valid regex. Use a plain keyword like \`discord.gg\` instead.`);
			}
		}

		let after = 0;
		if (request.timeframe) {
			const offset = new Duration(request.timeframe).offset;
			if (Number.isNaN(offset) || offset <= 0) {
				return this.errorEmbed('Invalid timeframe format. Use things like `15m`, `2h`, `1d`.');
			}
			after = Date.now() - offset;
		}

		const filtered = Boolean(request.user || request.role || request.bots || request.filter);
		const local = request.scope ? request.scope === 'local' : !filtered;

		const channels = this.resolveChannels(source, local);
		if (channels.length === 0) {
			return this.errorEmbed(local ? 'I cannot manage messages in this channel.' : 'I have no channels where I can manage messages.');
		}

		const result = await this.deleteAcross(channels, this.buildPredicate(request, regex, after), request);
		return this.resultEmbed(request, result, local);
	}

	private async deleteAcross(channels: GuildTextBasedChannel[], matches: (msg: Message) => boolean, request: PurgeRequest): Promise<PurgeResult> {
		const result: PurgeResult = { deleted: 0, oldSkipped: 0, channels: 0 };

		for (const channel of channels) {
			if (result.deleted >= request.amount) break;

			const batch = await this.deleteIn(channel, matches, request.amount - result.deleted, request.excludeId);
			result.deleted += batch.deleted;
			result.oldSkipped += batch.oldSkipped;
			if (batch.deleted > 0) result.channels++;
		}

		return result;
	}

	private resolveChannels(source: GuildTextBasedChannel, local: boolean): GuildTextBasedChannel[] {
		const me = source.guild.members.me;
		const canManage = (channel: GuildTextBasedChannel) =>
			!!me && channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages]);

		const first = canManage(source) ? [source] : [];
		if (local) return first;

		const rest = [...source.guild.channels.cache.values()].filter(
			(channel): channel is GuildTextBasedChannel => channel.isTextBased() && channel.id !== source.id && canManage(channel)
		);

		return [...first, ...rest];
	}

	private buildPredicate(request: PurgeRequest, regex: RegExp | null, after: number) {
		return (msg: Message) => {
			if (msg.id === request.excludeId) return false;
			if (request.user && msg.author.id !== request.user.id) return false;
			if (request.bots && !msg.author.bot) return false;
			if (request.role && !msg.member?.roles.cache.has(request.role.id)) return false;
			if (after && msg.createdTimestamp < after) return false;
			if (regex && !regex.test(msg.content)) return false;
			return true;
		};
	}

	private async deleteIn(channel: GuildTextBasedChannel, matches: (msg: Message) => boolean, limit: number, before?: string) {
		const cutoff = Date.now() - BULK_DELETE_MAX_AGE;
		let deleted = 0;
		let oldSkipped = 0;
		let scanned = 0;

		while (deleted < limit && scanned < MAX_SCAN_PER_CHANNEL) {
			const batch = await channel.messages.fetch({ limit: 100, before }).catch(() => null);
			if (!batch?.size) break;

			const oldest = batch.last()!;
			before = oldest.id;
			scanned += batch.size;

			const attempted = [...batch.values()].filter(matches).slice(0, limit - deleted);
			const deletable = attempted.filter((msg) => msg.createdTimestamp > cutoff);
			oldSkipped += attempted.length - deletable.length;

			const removed = await channel.bulkDelete(deletable, true).catch(() => null);
			deleted += removed?.size ?? 0;

			if (oldest.createdTimestamp <= cutoff) break;
		}

		return { deleted, oldSkipped };
	}

	private resultEmbed(request: PurgeRequest, result: PurgeResult, local: boolean): EmbedBuilder {
		let target = '';
		if (request.user) target = ` from ${request.user}`;
		else if (request.role) target = ` from members with ${request.role}`;
		else if (request.bots) target = ' sent by bots';

		const embed = new EmbedBuilder();
		if (result.deleted === 0) {
			embed.setColor(colors.yellow).setDescription(`Found no messages${target} to delete ${local ? 'in this channel' : 'in this server'}.`);
		} else {
			const where = local ? 'in this channel' : `across ${result.channels} channel${plural(result.channels)}`;
			embed.setColor(colors.green).setDescription(`Purged **${result.deleted}** message${plural(result.deleted)}${target} ${where}.`);
		}

		if (result.oldSkipped > 0) {
			embed.setFooter({ text: `${result.oldSkipped} message${plural(result.oldSkipped)} older than 14 days could not be deleted.` });
		}

		return embed;
	}

	private errorEmbed(message: string): EmbedBuilder {
		return new EmbedBuilder().setColor(colors.red).setDescription(message);
	}
}
