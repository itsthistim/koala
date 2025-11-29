import { ApplyOptions, RegisterChatInputCommand, RegisterUserContextMenuCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import {
	ApplicationIntegrationType,
	EmbedBuilder,
	GuildMember,
	Interaction,
	InteractionContextType,
	PermissionFlagsBits,
	User,
	type Message
} from 'discord.js';
import { colors } from '#lib/constants';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['whois', 'user-info'],
	description: 'Shows information about a user.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addUserOption((option) => option.setName('user').setDescription('The user to get information about').setRequired(false))
)
@RegisterUserContextMenuCommand((builder, command) =>
	builder
		.setName(command.name)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user') || interaction.user;
		let embed = await this.getInfoEmbed(interaction, user);
		return interaction.reply({ embeds: [embed] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const user = args.finished ? msg.author : await args.pick('userName').catch(() => null);

		if (!user) {
			return reply(msg, `Could not find the specified user ${args.getOption('user')}.`);
		}

		let embed = await this.getInfoEmbed(msg, user);
		return await reply(msg, { embeds: [embed] });
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		if (!interaction.isUserContextMenuCommand()) return;

		const user = interaction.targetUser;
		let embed = await this.getInfoEmbed(interaction, user);
		return interaction.reply({ embeds: [embed] });
	}

	private async getInfoEmbed(interaction: Interaction | Message, user: User) {
		const status = {
			online: '<:online:861986701580697670> ',
			idle: '<:idle:861986831541207042>',
			dnd: '<:dnd:861986768517070938> ',
			streaming: '<:streaming:861986871578722364>',
			offline: '<:offline:861986750952112189> ',
			invisible: '<:offline:861986750952112189> '
		};

		const key_permissions = [
			{ perm: PermissionFlagsBits.Administrator, name: 'Administrator' },
			{ perm: PermissionFlagsBits.ManageGuild, name: 'Manage Server' },
			{ perm: PermissionFlagsBits.ManageRoles, name: 'Manage Roles' },
			{ perm: PermissionFlagsBits.ManageMessages, name: 'Manage Messages' },
			{ perm: PermissionFlagsBits.ManageChannels, name: 'Manage Channels' },
			{ perm: PermissionFlagsBits.ManageThreads, name: 'Manage Threads' },
			{ perm: PermissionFlagsBits.ManageWebhooks, name: 'Manage Webhooks' },
			{ perm: PermissionFlagsBits.ManageNicknames, name: 'Manage Nicknames' },
			{ perm: PermissionFlagsBits.ManageGuildExpressions, name: 'Manage Emojis' },
			{ perm: PermissionFlagsBits.BanMembers, name: 'Ban Members' },
			{ perm: PermissionFlagsBits.KickMembers, name: 'Kick Members' },
			{ perm: PermissionFlagsBits.MentionEveryone, name: 'Mention Everyone' }
		];

		// check whether the user is a guild member for guild-specific infos
		let member: GuildMember | null = null;
		if ('guild' in interaction && interaction.guild) {
			member = await interaction.guild.members.fetch(user.id).catch(() => null);
		}

		const embed = new EmbedBuilder()
			.setColor(colors.default)
			.setAuthor({
				name: `${user.username}`,
				iconURL: user.displayAvatarURL()
			})
			.setThumbnail(user.displayAvatarURL())
			.setDescription(`${user}`)
			.addFields({ name: 'Joined Discord', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true });

		if (member !== null) {
			embed.setColor(member.displayColor === 0 ? colors.default : member.displayColor);
			embed.setAuthor({
				name: `${member.user.tag}`,
				iconURL: user.displayAvatarURL()
			});
			embed.setDescription(`${member.presence ? status[member.presence.status] : ''}${member}`);
			embed.addFields(
				{
					name: 'Joined Server',
					value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
					inline: true
				},
				{
					name: `Roles [${member.roles.cache.size - 1}]`,
					value:
						member.roles.cache.size > 1
							? member.roles.cache
									.filter((r) => r.id !== interaction.guild!.id)
									.sort((a, b) => b.position - a.position)
									.map((r) => r.toString())
									.join(' ')
							: 'None',
					inline: false
				}
			);

			const userPermissions = member.permissions;
			const hasKeyPermissions = key_permissions.filter(({ perm }) => userPermissions.has(perm));
			if (hasKeyPermissions.length > 0) {
				embed.addFields({
					name: 'Key Permissions',
					value: hasKeyPermissions.map(({ name }) => name).join(', '),
					inline: false
				});
			}
		}

		return embed;
	}
}
