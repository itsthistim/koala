import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class SkipCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'skip',
			aliases: ['s'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Skips the current song.',
			detailedDescription: '',
			usage: '',
			examples: []
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['502208815937224715']
				// idHints: '123456789012345678'
			}
		);
	}

	async chatInputRun(interaction) {
		if (!interaction.member.voice.channel) return interaction.reply({ content: 'You need to be in a voice voice channel to run this command!' });

		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (queue) queue.skip();
		return;
	}

	async messageRun(message, args) {
		if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

		const queue = this.container.client.distube.getQueue(message.guild);
		if (queue) queue.skip();
		return;
	}
}
