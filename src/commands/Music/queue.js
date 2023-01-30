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
					chatInputRun: 'slashLoopMode',
					messageRun: 'msgLoopMode'
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
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
					.addSubcommand((command) =>
						command
							.setName('loop')
							.setDescription('Sets the loop mode.')
							.addStringOption((option) =>
								option
									.setName('mode')
									.setDescription('The loop mode.')
									.setRequired(true)
									.addChoices({ name: 'Off', value: 'off' }, { name: 'Song', value: 'song' }, { name: 'Queue', value: 'queue' }, { name: 'Autoplay', value: 'autoplay' })
							)
					);
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1069393085383065660'
			}
		);
	}

	//#region View
	async msgView(message) {
		const queue = this.container.client.distube.getQueue(message);

		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		const q = queue.songs.map((song, i) => `${i === 0 ? 'Playing:' : `**${i}.**`} **[${song.name}](${song.url})** \`(${song.formattedDuration})\`${i === 0 ? '\n' : ''}`).join('\n');
		return reply(message, {
			embeds: [
				{
					title: `Queue`,
					description: q,
					color: COLORS.DEFAULT
				}
			]
		});
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
		
		return interaction.reply({ content: `Skipped to **${queue.songs[song].name}**!` });
	}

	async msgSkipTo(message, args) {
		const song = await args.rest('number').catch(() => null);
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		if (song < 1 || song > queue.songs.length) return reply(message, `That song is not in the queue!`);

		queue.jump(song);

		return reply(message, `Skipped to **${queue.songs[song - 1].name}**!`);
	}
	//#endregion

	//#region Shuffle
	async slashShuffle(interaction) {
		const queue = this.container.client.distube.getQueue(interaction.guild);
		if (!queue) return reply(interaction, `There is nothing in the queue right now!`);

		queue.shuffle();
		return reply(interaction, `Shuffled the queue!`);
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
		if (!queue) return reply(interaction, `There is nothing in the queue right now!`);

		const mode = interaction.options.getInteger('mode');
		if (mode < 0 || mode > 2) return reply(interaction, `That is not a valid mode!`);

		queue.setRepeatMode(mode);
		return reply(interaction, `Set the loop mode to **${mode}**!`);
	}

	async msgLoop(message) {
		const queue = this.container.client.distube.getQueue(message);
		if (!queue) return reply(message, `There is nothing in the queue right now!`);

		const mode = message.args[0];
		if (mode < 0 || mode > 2) return reply(message, `That is not a valid mode!`);

		queue.setRepeatMode(mode);
		return reply(message, `Set the loop mode to **${mode}**!`);
	}
	//#endregion
}
