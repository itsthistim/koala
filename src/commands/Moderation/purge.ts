import { ApplyOptions, RegisterChatInputCommand, RegisterUserContextMenuCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Duration } from '@sapphire/time-utilities';
import {
	ApplicationIntegrationType,
	EmbedBuilder,
	type GuildTextBasedChannel,
	InteractionContextType,
	type Message,
	MessageFlags,
	PermissionFlagsBits,
	type Role,
	type User
} from 'discord.js';
import { colors } from '#lib/constants';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall];
const contexts: InteractionContextType[] = [InteractionContextType.Guild];

/** Discord only allows bulk-deleting messages younger than 14 days. */
const BULK_DELETE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;
/** Largest amount accepted in a single command. */
const MAX_AMOUNT = 1000;
/** Safety net so a rare filter can't scan a channel's entire history forever. */
const MAX_SCAN_PER_CHANNEL = 10_000;
/** How many messages the context-menu action removes (it has no amount input). */
const CONTEXT_MENU_AMOUNT = 100;

interface PurgeRequest {
	amount: number;
	user: User | null;
	role: Role | null;
	bots: boolean;
	/**
	 * Where to purge. `auto` (the default) stays in the current channel for an unfiltered purge
	 * and spans the whole server once an author/content filter is set; `local`/`global` force it.
	 */
	scope: 'auto' | 'local' | 'global';
	/** Keyword/regex the message content must match. */
	filter: string | null;
	/** Only delete messages newer than this window (e.g. "10m", "2h", "1d"). */
	timeframe: string | null;
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
	flags: ['l', 'local', 'g', 'global', 'bots'],
	options: ['filter', 'timeframe']
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
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
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = await this.run(interaction.channel as GuildTextBasedChannel | null, {
			amount: interaction.options.getInteger('count', true),
			user: interaction.options.getUser('user'),
			role: interaction.options.getRole('role') as Role | null,
			bots: interaction.options.getBoolean('bots') ?? false,
			scope: (interaction.options.getString('scope') as 'local' | 'global' | null) ?? 'auto',
			filter: interaction.options.getString('filter'),
			timeframe: interaction.options.getString('timeframe')
		});

		return interaction.editReply({ embeds: [embed] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const amount = await args.pick('integer').catch(() => null);
		if (amount === null) {
			return reply(msg, 'Please provide how many messages to delete.\nUsage: `purge <count> [user|role|bots] [--local|--global] [--filter=<regex>] [--timeframe=<10m>]`');
		}
		if (amount < 1 || amount > MAX_AMOUNT) {
			return reply(msg, `Count must be between 1 and ${MAX_AMOUNT}.`);
		}

		// `purge <count> [user|role|bots]` — the optional second argument may be a user, a role or the literal "bots".
		let user: User | null = null;
		let role: Role | null = null;
		let bots = args.getFlags('bots');

		if (!args.finished) {
			user = await args.pick('userName').catch(() => null);
			if (!user) role = await args.pick('role').catch(() => null);
			if (!user && !role) {
				const word = await args.pick('string').catch(() => null);
				if (word?.toLowerCase() === 'bots') bots = true;
			}
		}

		const embed = await this.run(
			msg.channel as GuildTextBasedChannel,
			{
				amount,
				user,
				role,
				bots,
				scope: this.scopeFromFlags(args),
				filter: args.getOption('filter'),
				timeframe: args.getOption('timeframe')
			},
			msg.id
		);

		return reply(msg, { embeds: [embed] });
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		if (!interaction.isUserContextMenuCommand()) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = await this.run(interaction.channel as GuildTextBasedChannel | null, {
			amount: CONTEXT_MENU_AMOUNT,
			user: interaction.targetUser,
			role: null,
			bots: false,
			scope: 'auto',
			filter: null,
			timeframe: null
		});

		return interaction.editReply({ embeds: [embed] });
	}

	private async run(source: GuildTextBasedChannel | null, request: PurgeRequest, excludeId?: string): Promise<EmbedBuilder> {
		if (!source?.guild) return this.errorEmbed('This command can only be used in a server.');

		// Compile the optional content filter and time window up front so bad input fails fast.
		let regex: RegExp | null = null;
		if (request.filter) {
			try {
				regex = new RegExp(request.filter, 'i');
			} catch {
				return this.errorEmbed(`Invalid regex pattern: \`${request.filter}\``);
			}
		}

		let timeLimit: number | null = null;
		if (request.timeframe) {
			const offset = new Duration(request.timeframe).offset;
			if (Number.isNaN(offset) || offset <= 0) {
				return this.errorEmbed('Invalid timeframe format. Use things like `15m`, `2h`, `1d`.');
			}
			timeLimit = Date.now() - offset;
		}

		const local = this.resolveLocal(request);
		const channels = this.resolveChannels(source, local);
		if (channels.length === 0) {
			return this.errorEmbed(local ? 'I cannot manage messages in this channel.' : 'I have no channels where I can manage messages.');
		}

		const predicate = this.buildPredicate(request, regex, timeLimit, excludeId);

		const result: PurgeResult = { deleted: 0, oldSkipped: 0, channels: 0 };
		for (const channel of channels) {
			if (result.deleted >= request.amount) break;

			const remaining = request.amount - result.deleted;
			const channelResult = await this.purgeChannel(channel, predicate, remaining, excludeId);

			result.deleted += channelResult.deleted;
			result.oldSkipped += channelResult.oldSkipped;
			if (channelResult.deleted > 0) result.channels++;
		}

		return this.buildResultEmbed(request, result, local);
	}

	/** Resolve the requested scope to a concrete "current channel only?" decision. */
	private resolveLocal(request: PurgeRequest): boolean {
		if (request.scope === 'local') return true;
		if (request.scope === 'global') return false;
		// auto: a bare count purge stays local; any author/content filter goes server-wide.
		return !this.isFiltered(request);
	}

	private isFiltered(request: PurgeRequest): boolean {
		return Boolean(request.user || request.role || request.bots || request.filter);
	}

	/** Translate the message command's scope flags into a scope. `--local` wins over `--global`. */
	private scopeFromFlags(args: Args): PurgeRequest['scope'] {
		if (args.getFlags('l', 'local')) return 'local';
		if (args.getFlags('g', 'global')) return 'global';
		return 'auto';
	}

	/** Determine which channels to purge in, keeping only ones the bot can actually manage. */
	private resolveChannels(source: GuildTextBasedChannel, local: boolean): GuildTextBasedChannel[] {
		const guild = source.guild;
		const me = guild.members.me;

		const canManage = (channel: GuildTextBasedChannel) =>
			!!me && channel.permissionsFor(me).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages]);

		if (local) {
			return canManage(source) ? [source] : [];
		}

		// Server-wide (default): every text-based channel the bot can manage, current channel first.
		return [...guild.channels.cache.values()]
			.filter((channel): channel is GuildTextBasedChannel => channel.isTextBased() && canManage(channel))
			.sort((a, b) => this.compareChannels(a, b, source.id));
	}

	/** Sort comparator that keeps the current channel first, then orders the rest newest-first. */
	private compareChannels(a: GuildTextBasedChannel, b: GuildTextBasedChannel, currentId: string): number {
		if (a.id === currentId) return -1;
		if (b.id === currentId) return 1;
		return Number(BigInt(b.id) - BigInt(a.id));
	}

	private buildPredicate(request: PurgeRequest, regex: RegExp | null, timeLimit: number | null, excludeId?: string): (msg: Message) => boolean {
		return (msg: Message) => {
			if (excludeId && msg.id === excludeId) return false;
			if (request.user && msg.author.id !== request.user.id) return false;
			if (request.bots && !msg.author.bot) return false;
			if (request.role && !msg.member?.roles.cache.has(request.role.id)) return false;
			if (timeLimit && msg.createdTimestamp < timeLimit) return false;
			if (regex && !regex.test(msg.content)) return false;
			return true;
		};
	}

	/**
	 * Recursively scans a channel in batches of 100, deleting matching messages until `limit`
	 * is reached or the channel is exhausted. This is what lets a purge exceed Discord's
	 * 100-message bulk-delete cap.
	 */
	private async purgeChannel(
		channel: GuildTextBasedChannel,
		predicate: (msg: Message) => boolean,
		limit: number,
		excludeId?: string
	): Promise<{ deleted: number; oldSkipped: number }> {
		const cutoff = Date.now() - BULK_DELETE_MAX_AGE;
		let deleted = 0;
		let oldSkipped = 0;
		let scanned = 0;
		let before = excludeId;

		while (deleted < limit && scanned < MAX_SCAN_PER_CHANNEL) {
			const batch = await channel.messages.fetch({ limit: 100, before }).catch(() => null);
			if (!batch || batch.size === 0) break;

			before = batch.last()?.id;
			scanned += batch.size;

			const matching = [...batch.values()].filter(predicate);
			const deletable = matching.filter((msg) => msg.createdTimestamp > cutoff);
			oldSkipped += matching.length - deletable.length;

			const toDelete = deletable.slice(0, limit - deleted);
			if (toDelete.length > 0) {
				const removed = await channel.bulkDelete(toDelete, true).catch(() => null);
				if (removed) deleted += removed.size;
			}

			// Messages are returned newest-first; once the batch crosses the 14-day line everything
			// older is undeletable, so there's nothing left worth scanning.
			const oldest = batch.last();
			if (oldest && oldest.createdTimestamp <= cutoff) break;
		}

		return { deleted, oldSkipped };
	}

	private buildResultEmbed(request: PurgeRequest, result: PurgeResult, local: boolean): EmbedBuilder {
		let target = '';
		if (request.user) target = `from ${request.user}`;
		else if (request.role) target = `from members with ${request.role}`;
		else if (request.bots) target = 'sent by bots';

		const channelPlural = result.channels === 1 ? '' : 's';
		const scope = local ? 'in this channel' : `across ${result.channels} channel${channelPlural}`;

		let description: string;
		if (result.deleted > 0) {
			const messagePlural = result.deleted === 1 ? '' : 's';
			description = `Purged **${result.deleted}** message${messagePlural} ${target} ${scope}.`.replace(/\s+/g, ' ').trim();
		} else {
			description = `Found no messages matching the given criteria ${local ? 'in this channel' : 'in this server'}.`;
		}

		const embed = new EmbedBuilder().setColor(result.deleted > 0 ? colors.green : colors.yellow).setDescription(description);

		if (result.oldSkipped > 0) {
			embed.setFooter({
				text: `${result.oldSkipped} message${result.oldSkipped === 1 ? '' : 's'} older than 14 days could not be deleted.`
			});
		}

		return embed;
	}

	private errorEmbed(message: string): EmbedBuilder {
		return new EmbedBuilder().setColor(colors.red).setDescription(message);
	}
}
