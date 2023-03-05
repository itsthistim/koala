import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class VolumeCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'volume',
			aliases: ['vol'],
			requiredUserPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			requiredClientPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Sets the volume of the music in percent.',
			detailedDescription: '',
			usage: '',
			examples: ['25', '80', '100']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addIntegerOption((option) => option.setName('volume').setDescription('The volume in percent.').setRequired(true));
			},
			{
				guildIds: ['502208815937224715'],
				idHints: process.env.NODE_ENV == 'PRODUCTION' ? '1081710866271051776' : '1081716384054136913'
			}
		);
	}

	async messageRun(message, args) {
		let volume = await args.rest('integer').catch(() => {
			return reply(message, 'You need to specify a volume!');
		});

		if (!volume && volume != 0) return reply(message, 'You need to specify a volume!');
		if (volume > 100) return reply(message, 'The volume can not be higher than 100%');
		if (volume < 0) return reply(message, 'The volume can not be lower than 0%');

		this.container.client.distube.setVolume(message, volume);
	}

	async chatInputRun(interaction) {
		let volume = interaction.options.getInteger('volume');

		if (!volume && volume != 0) return interaction.reply({ content: 'You need to specify a volume!', ephemeral: true });
		if (volume > 100) return interaction.reply({ content: 'The volume can not be higher than 100%', ephemeral: true });
		if (volume < 0) return interaction.reply({ content: 'The volume can not be lower than 0%', ephemeral: true });

		this.container.client.distube.setVolume(interaction, volume);

        return interaction.reply({ content: `Volume set to ${volume}%`, ephemeral: true });
	}
}
