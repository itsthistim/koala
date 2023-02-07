import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class NowPlayingCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'nowplaying',
			aliases: ['np', 'current', 'currentsong', 'current-song'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Shows the currently playing song.',
			detailedDescription: '',
			usage: '',
			examples: []
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(process.env === 'production' ? this.name : this.name + '-dev').setDescription(this.description);
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627692698091661'
			}
		);
	}

	async chatInputRun(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return reply(interaction, `There is nothing in the queue right now!`);

		const song = queue.songs[0];
		return interaction.reply({
			embeds: [
				{
					title: `Now playing`,
					description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}\n` + `${this.progressBar(queue)} \`[${queue.formattedCurrentTime}/${song.formattedDuration}]\``,
					thumbnail: {
						url: `${song.thumbnail}`
					},
					color: COLORS.GREEN
				}
			]
		});
	}

	async messageRun(message, args) {
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		const song = queue.songs[0];
		return reply(message, {
			embeds: [
				{
					title: `Now playing`,
					description:
						`**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}\n` +
						`${this.progressBar(queue)} \`[${queue.formattedCurrentTime}/${song.formattedDuration}]\``,
					thumbnail: {
						url: `${song.thumbnail}`
					},
					color: COLORS.GREEN
				}
			]
		});
	}

	progressBar(queue) {
		const current = queue.currentTime;
		const total = queue.songs[0].duration;
		const progress = Math.round((current / total) * 20);
		return `**${'▬'.repeat(progress)}${'┉'.repeat(20 - progress)}**`;
	}
}
