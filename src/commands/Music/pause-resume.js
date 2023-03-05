import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class PauseCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'pause-resume',
			aliases: ['pause', 'resume', 'unpause', 'continue', 'pause-resume', 'hold'],
			requiredUserPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			requiredClientPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Pauses or resumes the current song.',
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
				guildIds: ['502208815937224715'],
				idHints: process.env.NODE_ENV == 'PRODUCTION' ? '1081710780325580830' : '1081716297483702332'
			}
		);
	}

	async chatInputRun(interaction) {
		let queue = this.container.client.distube.getQueue(interaction);
		if (!queue) return interaction.reply({ content: 'There is nothing playing right now!' });

		if (queue.paused) {
			this.container.client.distube.resume(interaction);
			return interaction.reply({ content: 'Resumed the music!', ephemeral: true });
		} else {
			this.container.client.distube.pause(interaction);
			return interaction.reply({ content: 'Paused the music!', ephemeral: true });
		}
	}

	async messageRun(message, args) {
		let queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, 'There is nothing playing right now!');

		if (queue.paused) {
			return this.container.client.distube.resume(message);
		} else {
			return this.container.client.distube.pause(message);
		}
	}
}
