import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class LoopCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'loop',
			aliases: ['repeat'],
			requiredUserPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			requiredClientPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Loops the queue or a song.',
			detailedDescription: '',
			usage: '[song|queue|off]',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption((option) =>
					option
						.setName('mode')
						.setDescription('The loop mode.')
						.setRequired(true)
						.addChoices({ name: 'Off', value: 0 }, { name: 'Song', value: 1 }, { name: 'Queue', value: 2 }, { name: 'Auto Play', value: 3 })
				);
		});
	}

	async chatInputRun(interaction) {
		let mode = interaction.options.getInteger('mode');
		let queue = this.container.client.distube.getQueue(interaction.guild);

		if (!queue) return interaction.reply({ content: `There is nothing playing right now!` });

		if (mode == 1 || mode == 2) {
			queue.setRepeatMode(mode);
			return interaction.reply({ content: `Now looping ${mode == 1 ? 'this **song**' : 'the **queue**'}!` });
		} else if (mode == 0) {
			queue.setRepeatMode(mode);
			return interaction.reply({ content: `No longer looping!` });
		} else if (mode == 3) {
			queue.toggleAutoplay();
			queue.setRepeatMode(0);
			return interaction.reply({ content: `${queue.autoplay == true ? 'Enabled' : 'Disabled'} Auto-Play!` });
		} else {
			if (queue.autoplay) return interaction.reply({ content: `Currently **auto-playing**!` });
			if ((queue.repeatMode = 0)) return interaction.reply({ content: `Currently not looping!` });
			if ((queue.repeatMode = 1)) return interaction.reply({ content: `Currently looping the **current song**!` });
			if ((queue.repeatMode = 2)) return interaction.reply({ content: `Currently looping the **queue**!` });
		}
	}

	async messageRun(message, args) {
		let mode = await args.rest('number').catch(async () => await args.rest('string').catch(() => null));
		let queue = this.container.client.distube.getQueue(message);

		if (!queue) return reply(message, `There is nothing playing right now!`);

		if (typeof mode === 'string') {
			switch (mode.toLowerCase()) {
				case 'off' || 'none' || 'disable' || 'disabled':
					mode = 0;
					break;
				case 'song' || 'track' || 'current':
					mode = 1;
					break;
				case 'queue' || 'all':
					mode = 2;
					break;
				case 'auto' || 'autoplay':
					mode = 3;
					break;
				default:
					return reply(message, `That is not a valid mode!`);
			}
		}

		if (mode == 1 || mode == 2) {
			queue.setRepeatMode(mode);
			return reply(message, `Now looping ${mode == 1 ? 'this **song**' : 'the **queue**'}!`);
		} else if (mode == 0) {
			queue.setRepeatMode(mode);
			return reply(message, `No longer looping!`);
		} else if (mode == 3) {
			queue.toggleAutoplay();
			queue.setRepeatMode(0);
			return reply(message, `${queue.autoplay == true ? 'Enabled' : 'Disabled'} Auto-Play!`);
		} else {
			switch (queue.repeatMode) {
				case 0:
					reply(message, `Currently not looping!`);
					break;
				case 1:
					reply(message, `Currently looping the **current song**!`);
					break;
				case 2:
					reply(message, `Currently looping the **queue**!`);
					break;
				case 3:
					reply(message, `Currently **auto-playing**!`);
					break;
			}
		}
	}
}
