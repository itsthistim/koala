import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

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
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev')
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
					.addSubcommand((command) =>
						command
							.setName('loop')
							.setDescription('Sets the loop mode.')
							.addIntegerOption((option) =>
								option
									.setName('mode')
									.setDescription('The loop mode.')
									.setRequired(true)
									.addChoices({ name: 'Off', value: 0 }, { name: 'Song', value: 1 }, { name: 'Queue', value: 2 }, { name: 'Autoplay', value: 3 })
							)
					);
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627772951887912'
			}
		);
	}

	//#region View
	async msgView(message) {
		const queue = this.container.client.distube.getQueue(message);

		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		const q = queue.songs.map((song, i) => `${i === 0 ? 'Playing:' : `**${i}.**`} **[${song.name}](${song.url})** \`(${song.formattedDuration})\`${i === 0 ? '\n' : ''}`).join('\n');

		const embed = new EmbedBuilder()
		.setTitle(`Queue`)
		.setDescription(q)
		.setColor(COLORS.DEFAULT);

		if (queue.repeatMode != 0 && queue.autoplay == false) embed.setFooter({ text: `Looping ${queue.repeatMode == 2 ? 'queue' : 'song'}.` });
		else if (queue.autoplay == true) embed.setFooter({ text: `Auto-Play enabled.` });

		return reply(message, { embeds: [embed] });
	}

	async slashView(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing in the queue right now!` });

		const q = queue.songs.map((song, i) => `${i === 0 ? 'Playing:' : `**${i}.**`} **[${song.name}](${song.url})** \`(${song.formattedDuration})\`${i === 0 ? '\n' : ''}`).join('\n');
		return interaction.reply({
			embeds: [
				{
					title: `Queue`,
					description: q,
					color: COLORS.DEFAULT
				}
			]
		});
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

		queue.songs.splice(song, 1);
		return interaction.reply({
			content: `Removed **${queue.songs[song - 1].name}** from the queue!`
		});
	}

	async msgRemove(message, args) {
		var song = await args.rest('number').catch(() => null);
		if (!song) return reply(message, `Please provide a song to remove!`);

		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		if (song < 1 || song > queue.songs.length) return reply(message, `That song is not in the queue!`);

		queue.songs.splice(song, 1);
		return reply(message, `Removed **${queue.songs[song - 1].name}** from the queue!`);
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
		const mode = interaction.options.getInteger('mode');
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return interaction.reply({ content: `There is nothing playing right now!` });

		if (mode == 1 || mode == 2) {
			queue.setRepeatMode(mode);
			return interaction.reply({ content: `Now looping **${mode == 1 ? 'this song' : 'the queue'}**!` });
		} else if (mode == 0) {
			queue.setRepeatMode(mode);
			return interaction.reply({ content: `No longer looping!` });
		} else if (mode == 3) {
			queue.toggleAutoplay();
			return interaction.reply({ content: `${queue.autoplay == true ? 'Enabled' : 'Disabled'} auto play!` });
		} else {
			return interaction.reply({ content: `Please provide a valid mode!` });
		}
	}

	async msgLoop(message, args) {
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
		} else if ((mode = 0)) {
			queue.setRepeatMode(mode);
			return reply(message, `No longer looping!`);
		} else if ((mode = 3)) {
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
	//#endregion
}
