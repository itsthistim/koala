import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { CookieStore } from '@sapphire/plugin-api';

export class ServerListCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			name: 'setup',
			aliases: [],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: ['adminOnly'],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Setup some things in a server.',
			detailedDescription:
				'`setup mute <role>`: Takes a role and sets all channels to have that role. Also denies permissions to communicate with other members. They can still join voice channels but not talk in them.\n\n`setup bot <role>`: Takes a role and attempts to assign all bots to this role.\n\n`setup sync`: Syncs permissions with the parent channel.',
			usage: '',
			examples: [''],
			subcommands: [
				{
					name: 'info',
					chatInputRun: 'chatInputRunInfo',
					messageRun: 'messageRunInfo',
					default: true
				},
				{
					name: 'botrole',
					chatInputRun: 'chatInputRunBotrole',
					messageRun: 'messageRunBotrole'
				},
				{
					name: 'muterole',
					chatInputRun: 'chatInputRunMuterole',
					messageRun: 'messageRunMuterole'
				},
				{
					name: 'syncchannels',
					chatInputRun: 'chatInputRunSyncchannels',
					messageRun: 'messageRunSyncchannels'
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env === 'production' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addSubcommand((command) => command.setName('info').setDescription('Get info about the setup command.'))
					.addSubcommand((command) =>
						command
							.setName('botrole')
							.setDescription('Set the bot role.')
							.addRoleOption((option) => option.setName('role').setDescription('The role to set as the bot role.').setRequired(true))
					)
					.addSubcommand((command) =>
						command
							.setName('muterole')
							.setDescription('Set the mute role.')
							.addRoleOption((option) => option.setName('role').setDescription('The role to set as the mute role.').setRequired(true))
					)
					.addSubcommand((command) => command.setName('syncchannels').setDescription('Sync channels with parent channel.'));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'], // guilds for the command to be registered in; global if empty
				idHints: '1069393171068485652'
			}
		);
	}

	//#region Info
	async chatInputRunInfo(interaction) {
		await interaction.reply({
			embeds: [this.getInfoEmbed()],
			ephemeral: true
		});
	}

	async messageRunInfo(message) {
		return reply(message, { embeds: [this.getInfoEmbed()] });
	}

	getInfoEmbed() {
		return new EmbedBuilder()
			.setTitle('Setup Command')
			.addFields(
				{
					name: 'Botrole',
					value: 'Takes a role and sets it as the bot role. All bots will be given this role.'
				},
				{
					name: 'Muterole',
					value: 'Takes a role and sets it as the mute role. All channels will be updated with the mute role.'
				},
				{
					name: 'Syncchannels',
					value: 'Syncs all channels with their respective parent channel.'
				}
			)
			.setColor(global.COLORS.DEFAULT);
	}
	//#endregion

	//#region Mute Role
	async chatInputRunMuterole(interaction) {
		const role = interaction.options.getRole('role');
		if (!role)
			return interaction.reply({
				content: 'You must provide a role.',
				ephemeral: true
			});

		this.processMuterole(role, interaction.guild);

		return await interaction.reply({
			content: `**\`${role.name}\`** has been set as the mute role. All channels have been updated.`,
			ephemeral: true
		});
	}

	async messageRunMuterole(message, args) {
		var role = await args.pick('role').catch(() => null);
		if (!role) return reply(message, 'You must provide a role.');

		this.processMuterole(role, message.guild);

		return reply(message, `**\`${role.name}\`** has been set as the mute role. All channels have been updated.`);
	}

	async processMuterole(role, guild) {
		// channel permissions
		const channels = guild.channels.cache.filter((c) => c.type === 'GUILD_TEXT' || c.type === 'GUILD_VOICE');
		const promises = [];
		for (const channel of channels.values()) {
			promises.push(
				channel.permissionOverwrites.edit(role, {
					SEND_MESSAGES: false,
					SPEAK: false,
					ADD_REACTIONS: false,
					CREATE_PUBLIC_THREADS: false,
					CREATE_PRIVATE_THREADS: false,
					SEND_MESSAGES_IN_THREADS: false
				})
			);
		}

		await Promise.all(promises);

		// role permissions
		const permissions = ['SEND_MESSAGES', 'SPEAK', 'ADD_REACTIONS', 'CREATE_PUBLIC_THREADS', 'CREATE_PRIVATE_THREADS', 'SEND_MESSAGES_IN_THREADS', 'CHANGE_NICKNAME'];
		const rolePermissions = role.permissions.toArray();
		const newPermissions = rolePermissions.filter((p) => !permissions.includes(p));
		await role.setPermissions(newPermissions);
	}
	//#endregion

	//#region Bot Role
	async chatInputRunBotrole(interaction) {
		const role = interaction.options.getRole('role');
		if (!role)
			return interaction.reply({
				content: 'You must provide a role.',
				ephemeral: true
			});

		this.processBotrole(role, interaction.guild);

		return await interaction.reply({
			content: `**\`${role.name}\`** has been set as the bot role. All bots have been updated.`,
			ephemeral: true
		});
	}

	async messageRunBotrole(message, args) {
		var role = await args.pick('role').catch(() => null);
		if (!role) return reply(message, 'You must provide a role.');

		this.processBotrole(role, message.guild);

		return reply(message, `**\`${role.name}\`** has been set as the bot role. All bots have been updated.`);
	}

	async processBotrole(role, guild) {
		const bots = guild.members.cache.filter((m) => m.user.bot);
		for (const bot of bots.values()) {
			bot.roles.add(role).catch(console.error);
		}
	}
	//#endregion

	//#region Sync Channels
	async chatInputRunSyncchannels(interaction) {
		this.syncChannels(interaction.guild);
		return await interaction.reply({
			content: `All channels have been synced with their respective parent channel.`,
			ephemeral: true
		});
	}

	async messageRunSyncchannels(message) {
		this.syncChannels(message.guild);
		return reply(message, `All channels have been synced with their respective parent channel.`);
	}

	async syncChannels(guild) {
		const channels = guild.channels.cache.filter((c) => c.type === 'GUILD_TEXT' || c.type === 'GUILD_VOICE');
		channels.forEach((channel) => {
			if (channel.parent) {
				channel.lockPermissions().catch(console.error);
			}
		});
	}
	//#endregion
}
