import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { capitalize } from '#lib/util';

export class FilterCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			name: 'filter',
			aliases: ['remix', 'remixes', 'filters', 'eq', 'equalizer', 'mix', 'mixes', 'effects', 'effect', 'eqs'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Applies a filter to the queue.',
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
					name: 'add',
					chatInputRun: 'slashAdd',
					messageRun: 'msgAdd'
				},
				{
					name: 'remove',
					chatInputRun: 'slashRemove',
					messageRun: 'msgRemove'
				},
				{
					name: 'clear',
					chatInputRun: 'slashClear',
					messageRun: 'msgClear'
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((command) => command.setName('view').setDescription('Shows the current and available filters.'))
				.addSubcommand((command) =>
					command
						.setName('add')
						.setDescription('Adds a filter.')
						.addStringOption((option) =>
							option
								.setName('filter')
								.setDescription('The filter to add.')
								.setRequired(true)
								.addChoices(
									{ name: '3D', value: '3d' },
									{ name: 'Bass Boost', value: 'bassboost' },
									{ name: 'Echo', value: 'echo' },
									{ name: 'Flanger', value: 'flanger' },
									{ name: 'Gate', value: 'gate' },
									{ name: 'Haas', value: 'haas' },
									{ name: 'Karaoke', value: 'karaoke' },
									{ name: 'Nightcore', value: 'nightcore' },
									{ name: 'Reverse', value: 'reverse' },
									{ name: 'Vaporwave', value: 'vaporwave' },
									{ name: 'Mcompand', value: 'mcompand' },
									{ name: 'Phaser', value: 'phaser' },
									{ name: 'Tremolo', value: 'tremolo' },
									{ name: 'Surround', value: 'surround' },
									{ name: 'Earwax', value: 'earwax' }
								)
						)
				)
				.addSubcommand((command) =>
					command
						.setName('remove')
						.setDescription('Removes a filter.')
						.addStringOption((option) =>
							option
								.setName('filter')
								.setDescription('The filter to remove.')
								.setRequired(true)
								.addChoices(
									{ name: '3D', value: '3d' },
									{ name: 'Bass Boost', value: 'bassboost' },
									{ name: 'Echo', value: 'echo' },
									{ name: 'Flanger', value: 'flanger' },
									{ name: 'Gate', value: 'gate' },
									{ name: 'Haas', value: 'haas' },
									{ name: 'Karaoke', value: 'karaoke' },
									{ name: 'Nightcore', value: 'nightcore' },
									{ name: 'Reverse', value: 'reverse' },
									{ name: 'Vaporwave', value: 'vaporwave' },
									{ name: 'Mcompand', value: 'mcompand' },
									{ name: 'Phaser', value: 'phaser' },
									{ name: 'Tremolo', value: 'tremolo' },
									{ name: 'Surround', value: 'surround' },
									{ name: 'Earwax', value: 'earwax' }
								)
						)
				)
				.addSubcommand((command) => command.setName('clear').setDescription('Removes all active filters.'));
		});
	}

	//#region View
	async msgView(message) {
		const queue = container.client.distube.getQueue(message);
		if (!queue) return reply(message, 'There is nothing playing right now!');

		const active = container.client.distube.getQueue(message).filters.names;
		const filters = Object.getOwnPropertyNames(container.client.distube.filters);

		const filterList = filters
			.map((filter) => {
				return active.includes(filter) ? `✅ ${filter}` : `❌ ${filter}`;
			})
			.join('\n');

		const embed = new EmbedBuilder() //
			.setTitle('Filters')
			.setDescription(filterList)
			.setFooter({
				text: `${this.container.client.fetchPrefix()[0]}filter add <filter>, ${this.container.client.fetchPrefix()[0]}filter remove <filter>, ${this.container.client.fetchPrefix()[0]}filter clear`
			})
			.setColor(COLORS.DEFAULT);

		return reply(message, { embeds: [embed] });
	}

	async slashView(interaction) {
		const queue = container.client.distube.getQueue(interaction);
		if (!queue) return interaction.reply('There is nothing playing right now.');

		const active = container.client.distube.getQueue(interaction).filters.names;
		const filters = Object.getOwnPropertyNames(container.client.distube.filters);

		const filterList = filters
			.map((filter) => {
				return active.includes(filter) ? `✅ ${filter}` : `❌ ${filter}`;
			})
			.join('\n');

		const embed = new EmbedBuilder().setTitle('Filters').setDescription(filterList).setColor(COLORS.DEFAULT);

		return interaction.reply({ embeds: [embed] });
	}
	//#endregion

	//#region Add
	async msgAdd(message, args) {
		let filter = await args.rest('string').catch(() => null);
		const queue = container.client.distube.getQueue(message);
		if (!queue) return reply(message, 'There is nothing playing right now!');

		let validFilters = Object.getOwnPropertyNames(container.client.distube.filters);

		if (!filter) return reply(message, `Please provide a filter to add. Use \`${message.prefix}filters\` to see all filters.`);
		if (!validFilters.includes(filter)) return reply(message, `Invalid filter! Use \`${message.prefix}filters\` to see all filters.`);
		if (queue.filters.names.includes(filter)) return reply(message, `The filter \`${filter}\` is already active.`);

		queue.filters.add(filter);

		return reply(message, `Applied \`${filter}\` to the queue.`);
	}

	async slashAdd(interaction) {
		const filter = interaction.options.getString('filter');
		const queue = container.client.distube.getQueue(interaction);
		if (!queue) return interaction.reply('There is nothing playing right now.');

		let validFilters = Object.getOwnPropertyNames(container.client.distube.filters);

		if (!filter) return interaction.reply(`Please provide a filter to add. Use \`${interaction.prefix}filters\` to see all filters.`);
		if (!validFilters.includes(filter)) return interaction.reply(`Invalid filter! Use \`${interaction.prefix}filters\` to see all filters.`);
		if (queue.filters.names.includes(filter)) return interaction.reply(`The filter \`${filter}\` is already active.`);

		queue.filters.add(filter);

		return interaction.reply(`Applied \`${filter}\` to the queue.`);
	}

	//#endregion

	//#region Remove
	async msgRemove(message, args) {
		let filter = await args.rest('string').catch(() => null);
		const queue = container.client.distube.getQueue(message);
		if (!queue) return reply(message, 'There is nothing playing right now!');

		let validFilters = Object.getOwnPropertyNames(container.client.distube.filters);

		if (!filter) return reply(message, `Please provide a filter to remove. Use \`${message.prefix}filters\` to see all filters.`);
		if (!validFilters.includes(filter)) return reply(message, `Invalid filter! Use \`${message.prefix}filters\` to see all filters.`);
		if (!queue.filters.names.includes(filter)) return reply(message, `The filter \`${filter}\` is not active.`);

		queue.filters.remove(filter);

		return reply(message, `Removed \`${filter}\` from the queue.`);
	}

	async slashRemove(interaction) {
		const filter = interaction.options.getString('filter');
		const queue = container.client.distube.getQueue(interaction);
		if (!queue) return interaction.reply('There is nothing playing right now.');

		let validFilters = Object.getOwnPropertyNames(container.client.distube.filters);

		if (!filter) return interaction.reply(`Please provide a filter to remove. Use \`${interaction.prefix}filters\` to see all filters.`);
		if (!validFilters.includes(filter)) return interaction.reply(`Invalid filter! Use \`${interaction.prefix}filters\` to see all filters.`);
		if (!queue.filters.names.includes(filter)) return interaction.reply(`The filter \`${filter}\` is not active.`);

		queue.filters.remove(filter);

		return interaction.reply(`Removed \`${filter}\` from the queue.`);
	}

	//#endregion

	//#region Clear
	async msgClear(message) {
		const queue = container.client.distube.getQueue(message);
		if (!queue) return reply(message, 'There is nothing playing right now!');

		queue.filters.clear();

		return reply(message, 'Cleared all active filters.');
	}
}
