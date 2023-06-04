import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class PlayCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'play',
			aliases: ['p'],
			requiredUserPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			requiredClientPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Plays a song.',
			detailedDescription: '',
			usage: '<query>',
			examples: ['bitch lasagna']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('query').setDescription('The song to play.').setRequired(true));
			},
			{
				guildIds: []
				, idHints: '1115020989433139280'
			}
		);
	}

	async chatInputRun(interaction) {
		let query = interaction.options.getString('query');
		query = query.replace('<', '').replace('>', '')

		if (!interaction.member.voice.channel)
			return interaction.reply({
				content: 'You need to be in a voice voice channel to run this command!'
			});

		this.container.client.distube.play(interaction.member.voice.channel, query, {
			metadata: { i: interaction },
			member: interaction.member,
			textChannel: interaction.channel
		});
	}

	async messageRun(message, args) {
		var query = await args.rest('string').catch(() => null);
		query = query.replace('<', '').replace('>', '')

		if (!query) return reply(message, 'You need to specify a song!');
		if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

		return this.container.client.distube.play(message.member.voice.channel, query, {
			member: message.member,
			textChannel: message.channel,
			message: message
		});
	}
}
