import { Subcommand } from '@sapphire/plugin-subcommands';
import { reply } from '@sapphire/plugin-editable-commands';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

export class UnregisterCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			name: 'unregister',
			aliases: [],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: ['ownerOnly'],
			generateDashLessAliases: true,
			flags: [],
			options: [],
			nsfw: false,
			description: 'Unregisters all slash commands.',
			usage: '[all|global|guild]',
			examples: [''],
			subcommands: [
				{
					name: 'global',
					chatInputRun: 'chatInputRunGlobal',
					messageRun: 'messageRunGlobal'
				},
				{
					name: 'guild',
					chatInputRun: 'chatInputRunGuild',
					messageRun: 'messageRunGuild'
				},
				{
					name: 'all',
					chatInputRun: 'chatInputRunAll',
					messageRun: 'messageRunAll',
					default: true
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder //
					.setName(this.name)
					.setDescription(this.description)
					.addSubcommand((command) => command.setName('all').setDescription('Unregister all application commands.'))
					.addSubcommand((command) => command.setName('global').setDescription('Unregister all global application commands.'))
					.addSubcommand((command) => command.setName('guild').setDescription('Unregister all guild application commands.'));
			},
			{
				guildIds: ['502208815937224715']
			}
		);
	}

	async chatInputRunAll(interaction) {
		this.unregisterAll(interaction.guild.id);
		return interaction.reply({
			content: 'Successfully unregistered **all** application commands.\nRestart to apply changes.',
			ephemeral: true
		});
	}

	async chatInputRunGlobal(interaction) {
		this.unregisterGlobal();
		return interaction.reply({
			content: 'Successfully unregistered all **global** application commands.\nRestart to apply changes.',
			ephemeral: true
		});
	}

	async chatInputRunGuild(interaction) {
		this.unregisterGuild(interaction.guild.id);
		return interaction.reply({
			content: 'Successfully unregistered all **guild** application commands.\nRestart to apply changes.',
			ephemeral: true
		});
	}

	async messageRunAll(message) {
		this.unregisterAll(message.guild.id);
		return reply(message, 'Successfully unregistered **all** application commands.\nRestart to apply changes.');
	}

	async messageRunGlobal(message) {
		this.unregisterGlobal();
		return reply(message, 'Successfully unregistered all **global** application commands.\nRestart to apply changes.');
	}

	async messageRunGuild(message) {
		this.unregisterGuild(message.guild.id);
		return reply(message, 'Successfully unregistered all **guild** application commands.\nRestart to apply changes.');
	}

	async unregisterGuild(guildId) {
		rest.put(Routes.applicationGuildCommands(client.id, guildId), { body: [] }).catch(console.error);
	}

	async unregisterGlobal() {
		rest.put(Routes.applicationCommands(client.id), { body: [] }).catch(console.error);
	}

	async unregisterAll(guildId) {
		rest
			.put(Routes.applicationGuildCommands(this.container.client.id, guildId), {
				body: []
			})
			.catch(console.error);
		rest.put(Routes.applicationCommands(this.container.client.id), { body: [] }).catch(console.error);
	}
}
