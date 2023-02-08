import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import moment from 'moment';

export class ServerInfoCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'serverinfo',
			aliases: ['serverinfo', 'server'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Shows information about the server.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev').setDescription(this.description);
			},
			{
				guildIds: [],
				idHints: '1072627605737586820'
			}
		);
	}

	async chatInputRun(interaction) {}

	async messageRun(message, args) {
		let embed = this.getInfoEmbed(message);
		return reply(message, { embeds: [embed] });
	}

	getInfoEmbed(interaction) {
		return new EmbedBuilder()
			.setColor(COLORS.DEFAULT)
			.setAuthor({
				name: interaction.guild.name,
				iconURL: interaction.guild.iconURL({ dynamic: true })
			})
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.addFields(
				{
					name: `Server Details`,
					value: `**Owner:** <@${interaction.guild.ownerId}>` + `\n**Channels:** ${interaction.guild.channels.cache.size}` + `\n**Roles:** ${interaction.guild.roles.cache.size}`,
					inline: true
				},
				{
					name: `\u200B`,
					value:
						`**Members:** ${interaction.guild.members.cache.size} | ${interaction.guild.members.cache.filter((member) => !member.user.bot).size}🧑 ${
							interaction.guild.members.cache.filter((member) => member.user.bot).size
						}🤖` +
						`\n**Boosts:** ${interaction.guild.premiumSubscriptionCount} | Level: ${interaction.guild.premiumTier === 'NONE' ? 0 : interaction.guild.premiumTier}` +
						`\n**Emojis:** ${interaction.guild.emojis.cache.size}`,
					inline: true
				},
				{
					name: `\u200B`,
					value: `Created at: ${moment(interaction.guild.createdAt).format('MMM Do YYYY, h:mm:ss a')}`,
					inline: false
				}
			);
	}
}
