import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, Emoji, PermissionFlagsBits } from 'discord.js';
import { StringUtil } from '#lib/util';
import { reply } from '@sapphire/plugin-editable-commands';
import moment from 'moment';

export class QueueCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			name: 'queue',
			aliases: ['q'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Shows the queue.',
			detailedDescription: '',
			usage: '',
			examples: [],
			subcommands: [
				{
					name: 'view',
					chatInputRun: 'slashView',
					messageRun: 'msgView',
					default: true
				},
				{
					name: 'clear',
					chatInputRun: 'slashClear',
					messageRun: 'msgClear'
				},
				{
					name: 'remove',
					chatInputRun: 'slashRemove',
					messageRun: 'msgRemove'
				},
				{
					name: 'skipto',
					chatInputRun: 'slashSkipTo',
					messageRun: 'msgSkipTo'
				},
				{
					name: 'shuffle',
					chatInputRun: 'slashShuffle',
					messageRun: 'msgShuffle'
				},
				{
					name: 'loop',
					chatInputRun: 'slashLoop',
					messageRun: 'msgLoop'
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((command) => command.setName('view').setDescription('Shows the queue.'))
				.addSubcommand((command) => command.setName('clear').setDescription('Clears the queue.'))
				.addSubcommand((command) =>
					command
						.setName('remove')
						.setDescription('Removes a song from the queue.')
						.addIntegerOption((option) => option.setName('song').setDescription('The song to remove.').setRequired(true))
				)
				.addSubcommand((command) =>
					command
						.setName('skipto')
						.setDescription('Skips to a song in the queue.')
						.addIntegerOption((option) => option.setName('song').setDescription('The song to skip to.').setRequired(true))
				)
				.addSubcommand((command) => command.setName('shuffle').setDescription('Shuffles the queue.'))
				.addSubcommand((command) => command.setName('loop').setDescription('Loops or unloops the queue.'));
		});
	}

	//#region View
	async msgView(message) {
		const queue = this.container.client.distube.getQueue(message);

		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		const q = queue.songs
			.map(
				(song, i) =>
					`${i === 0 ? `Playing: ` : `**${i}.** `}` +
					`**[${StringUtil.fitTo(song.name.toString(), 30, true)}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user} ${i === 0 ? '\n' : ''}`
			)
			.join('\n');

		let footer = this.getTotalDuration(queue.songs);
		if (queue.repeatMode != 0 && queue.autoplay == false) footer += ` • Looping ${queue.repeatMode == 2 ? 'queue' : 'song'}.`;
		else if (queue.autoplay == true) footer += ` • Auto-Play enabled.`;

		const embed = new EmbedBuilder();
		embed.setTitle(`Queue`);
		embed.setDescription(q);
		embed.setColor(COLORS.DEFAULT);
		embed.setThumbnail(queue.songs[0].thumbnail);
		embed.setFooter({ text: footer });

		return reply(message, { embeds: [embed] });
	}

	async slashView(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing in the queue right now!` });

		const q = queue.songs
			.map((song, i) => `${i === 0 ? 'Playing:' : `**${i}.**`} **[${StringUtil.fitTo(song.name.toString(), 30, true)}](${song.url})** \`(${song.formattedDuration})\`${i === 0 ? '\n' : ''}`)
			.join('\n');

		const embed = new EmbedBuilder().setTitle(`Queue`).setDescription(q).setColor(COLORS.DEFAULT);

		if (queue.repeatMode != 0 && queue.autoplay == false) embed.setFooter({ text: `Looping ${queue.repeatMode == 2 ? 'queue' : 'song'}.` });
		else if (queue.autoplay == true) embed.setFooter({ text: `Auto-Play enabled.` });

		return interaction.reply({ embeds: [embed] });
	}

	getTotalDuration(songs) {
		let duration = songs.reduce((acc, cur) => acc + cur.duration, 0);

		if (duration >= 86400) return moment.duration(duration, 'seconds').format('d:hh:mm:ss'); // 1 day or more
		else if (duration >= 3600) return moment.duration(duration, 'seconds').format('hh:mm:ss'); // 1 hour or more
		else return moment.duration(duration, 'seconds').format('mm:ss'); // 1 minute or more
	}
	//#endregion

	//#region Clear
	async slashClear(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue)
			return interaction.reply({
				content: `There is nothing in the queue right now!`
			});

		queue.stop();
		return interaction.reply({
			content: `Cleared the queue!`
		});
	}

	async msgClear(message) {
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		queue.stop();
		return reply(message, `Cleared the queue!`);
	}
	//#endregion

	//#region Remove
	async slashRemove(interaction) {
		const song = interaction.options.getInteger('song');
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing in the queue right now!` });

		if (song < 1 || song > queue.songs.length) return interaction.reply({ content: `That song is not in the queue!` });

		let removed = queue.songs.splice(song, 1);
		return interaction.reply({
			content: `Removed **${removed[0].name}** from the queue!`
		});
	}

	async msgRemove(message, args) {
		var song = await args.rest('number').catch(() => null);
		if (!song) return reply(message, `Please provide a song to remove!`);

		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		if (song < 1 || song > queue.songs.length) return reply(message, `That song is not in the queue!`);

		let removed = queue.songs.splice(song, 1);
		return reply(message, `Removed **${removed[0].name}** from the queue!`);
	}
	//#endregion

	//#region SkipTo
	async slashSkipTo(interaction) {
		const song = interaction.options.getInteger('song');
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing in the queue right now!` });

		if (song < 1 || song > queue.songs.length) return interaction.reply({ content: `That song is not in the queue!` });

		queue.jump(song);

		return interaction.reply({ content: `Skipped to **${queue.songs[0].name}**!`, ephemeral: true });
	}

	async msgSkipTo(message, args) {
		const song = await args.rest('number').catch(() => null);
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		if (song < 1 || song > queue.songs.length) return reply(message, `That song is not in the queue!`);

		return queue.jump(song);
	}
	//#endregion

	//#region Shuffle
	async slashShuffle(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return reply(interaction, `There is nothing in the queue right now!`);

		queue.shuffle();
		return interaction.reply({ content: `Shuffled the queue!` });
	}

	async msgShuffle(message) {
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		queue.shuffle();
		return reply(message, `Shuffled the queue!`);
	}
	//#endregion

	//#region Loop
	async slashLoop(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing in the queue right now!` });

		let currentMode = queue.autoplay ? 3 : queue.repeatMode;

		if (currentMode == 0 || currentMode == 1) {
			queue.setRepeatMode(2);
			return interaction.reply({ content: `Set loop mode to **queue**!` });
		} else if (currentMode == 2) {
			queue.setRepeatMode(0);
			return interaction.reply({ content: `Set loop mode to **off**!` });
		}
	}

	async msgLoop(message, args) {
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		let currentMode = queue.autoplay ? 3 : queue.repeatMode;

		if (currentMode == 0 || currentMode == 1) {
			queue.setRepeatMode(2);
			return reply(message, `Set loop mode to **queue**!`);
		} else if (currentMode == 2) {
			queue.setRepeatMode(0);
			return reply(message, `Set loop mode to **off**!`);
		}
	}
	//#endregion
}
