import { ApplyOptions, RegisterChatInputCommand, RegisterUserContextMenuCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Duration } from '@sapphire/time-utilities';
import {
	ApplicationIntegrationType,
	EmbedBuilder,
	type GuildMember,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	time,
	TimestampStyles,
	type Message,
	type User
} from 'discord.js';
import { colors } from '#lib/constants';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall];
const contexts: InteractionContextType[] = [InteractionContextType.Guild];

const DELETE_MESSAGE_SECONDS = 604800; // 7 days

interface BanOptions {
	reason?: string;
	deleteMessages: boolean;
	duration?: string | null;
}

@ApplyOptions<Command.Options>({
	description: 'Bans a user from the server.',
	requiredUserPermissions: [PermissionFlagsBits.BanMembers],
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	preconditions: ['OwnerOnly'], // TODO owner only as still wip
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	flags: ['d', 'delete'],
	options: ['t', 'time']
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Reason for the ban'))
		.addBooleanOption((option) =>
			option.setName('delete_messages').setDescription("Delete the last 7 days of the user's messages")
		)
		.addStringOption((option) =>
			option.setName('duration').setDescription('How long to ban (e.g. 1h, 7d, 1w). Omit for permanent.')
		)
)
@RegisterUserContextMenuCommand((builder, command) =>
	builder
		.setName(command.name)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const result = await this.executeBan(interaction, interaction.options.getUser('user', true), {
			reason: interaction.options.getString('reason') ?? undefined,
			deleteMessages: interaction.options.getBoolean('delete_messages') ?? false,
			duration: interaction.options.getString('duration')
		});

		return interaction.editReply({ embeds: [result] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const target = await args.pick('user').catch(() => null);
		if (!target) {
			return reply(msg, 'Please provide a user to ban.\nUsage: `ban <user> [reason] [--d] [--t=<time>]`');
		}

		const result = await this.executeBan(msg, target, {
			reason: await args.rest('string').catch(() => undefined),
			deleteMessages: args.getFlags('d', 'delete'),
			duration: args.getOption('t', 'time')
		});

		return reply(msg, { embeds: [result] });
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		if (!interaction.isUserContextMenuCommand()) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const result = await this.executeBan(interaction, interaction.targetUser, { deleteMessages: false });
		return interaction.editReply({ embeds: [result] });
	}

	private async executeBan(
		ctx: Message | Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction,
		target: User,
		opts: BanOptions
	): Promise<EmbedBuilder> {
		const { guild } = ctx;
		if (!guild) return this.errorEmbed('This command can only be used in a server.');

		const executor = 'author' in ctx ? ctx.author : ctx.user;

		if (target.id === executor.id) return this.errorEmbed('You cannot ban yourself.');
		if (target.id === ctx.client.user?.id) return this.errorEmbed('I cannot ban myself.');
		if (target.id === guild.ownerId) return this.errorEmbed('You cannot ban the server owner.');

		const [targetMember, executorMember, botMember] = await Promise.all([
			guild.members.fetch(target.id).catch(() => null),
			guild.members.fetch(executor.id).catch(() => null),
			guild.members.fetchMe().catch(() => null)
		]);

		const hierarchyError = this.checkHierarchy(targetMember, executorMember, botMember);
		if (hierarchyError) return this.errorEmbed(hierarchyError);

		const { banDuration, error: durationError } = this.parseDuration(opts.duration);
		if (durationError) return this.errorEmbed(durationError);

		const auditReason = opts.reason
			? `${opts.reason} | Banned by ${executor.username}`.slice(0, 512)
			: `Banned by ${executor.username}`;

		try {
			await guild.bans.create(target, {
				reason: auditReason,
				deleteMessageSeconds: opts.deleteMessages ? DELETE_MESSAGE_SECONDS : 0
			});
		} catch {
			return this.errorEmbed('Failed to ban the user. Please check my permissions and role hierarchy.');
		}

		if (banDuration) {
			await this.container.tasks.create(
				{ name: 'unban', payload: { guildId: guild.id, userId: target.id } },
				banDuration.offset
			);
		}

		return this.buildSuccessEmbed(target, opts, banDuration);
	}

	private checkHierarchy(
		targetMember: GuildMember | null,
		executorMember: GuildMember | null,
		botMember: GuildMember | null
	): string | null {
		if (!targetMember) return null;

		if (botMember && targetMember.roles.highest.position >= botMember.roles.highest.position) {
			return "I cannot ban this user — their highest role is at or above mine.";
		}
		if (executorMember && targetMember.roles.highest.position >= executorMember.roles.highest.position) {
			return "You cannot ban this user — their highest role is at or above yours.";
		}
		return null;
	}

	private parseDuration(durationStr?: string | null): { banDuration: Duration | null; error: string | null } {
		if (!durationStr) return { banDuration: null, error: null };

		const banDuration = new Duration(durationStr);
		if (!banDuration.offset || banDuration.offset <= 0 || Number.isNaN(banDuration.offset)) {
			return { banDuration: null, error: 'Invalid duration format. Use formats like: `30m`, `2h`, `7d`, `1w`' };
		}

		return { banDuration, error: null };
	}

	private buildSuccessEmbed(target: User, opts: BanOptions, duration: Duration | null): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setColor(colors.red)
			.setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
			.setTitle('User Banned')
			.addFields({ name: 'User', value: `${target} \`${target.id}\`` });

		if (opts.reason) {
			embed.addFields({ name: 'Reason', value: opts.reason });
		}

		if (duration) {
			const expiresAt = Math.floor((Date.now() + duration.offset) / 1000);
			embed.addFields({ name: 'Duration', value: time(expiresAt, TimestampStyles.RelativeTime), inline: true });
		} else {
			embed.addFields({ name: 'Duration', value: 'Permanent', inline: true });
		}

		if (opts.deleteMessages) {
			embed.addFields({ name: 'Messages', value: 'Last 7 days deleted', inline: true });
		}

		return embed;
	}

	private errorEmbed(message: string): EmbedBuilder {
		return new EmbedBuilder().setColor(colors.red).setDescription(message);
	}
}
