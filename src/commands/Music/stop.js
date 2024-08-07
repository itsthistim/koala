import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class PlayCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'stop',
			aliases: ['stop', 'leave', 'disconnect', 'dc'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Stops any playing song and leaves the voice channel.',
			detailedDescription: '',
			usage: '',
			examples: []
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description);
		});
	}

	async chatInputRun(interaction) {
		if (!interaction.member.voice.channel)
			return interaction.reply({
				content: 'You need to be in a voice voice channel to run this command!'
			});

		const queue = this.container.client.distube.getQueue(interaction.guild);

		if (queue) queue.stop();
		if (this.container.client.distube.voices.get(interaction.guild)) this.container.client.distube.voices.leave(interaction.guild);
		return;
	}

	async messageRun(message, args) {
		if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

		const queue = this.container.client.distube.getQueue(message.guild);
		if (queue) queue.stop();
		if (this.container.client.distube.voices.get(message.guild)) return this.container.client.distube.voices.leave(message.guild);
	}
}
