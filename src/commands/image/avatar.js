import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class AvatarCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'avatar',
			aliases: [''],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Shows the avatar of a user.',
			detailedDescription: '',
			usage: '@user#1234',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addUserOption((option) => option.setName('user').setDescription('The user to show the avatar of.').setRequired(false));
			},
			{
				guildIds: []
				, idHints: '1115020561962242138'
			}
		);
	}

	async chatInputRun(interaction) {
		const member = (await interaction.options.getMember('user')) ?? interaction.guild.members.cache.get(interaction.user.id);

		const embed = new EmbedBuilder()
			.setAuthor({
				name: member.user.username + '#' + member.user.discriminator,
				iconURL: member.user.displayAvatarURL({ dynamic: true })
			})
			.setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }));

		await interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		var member = await args.pick('member').catch(() => message.member);

		const embed = new EmbedBuilder()
			.setAuthor({
				name: member.user.username + '#' + member.user.discriminator,
				iconURL: member.user.displayAvatarURL({ dynamic: true })
			})
			.setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }));

		await reply(message, { embeds: [embed] });
	}
}
