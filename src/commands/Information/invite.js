import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';

export class InviteCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'invite',
			aliases: [''],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Creates an invite link for the bot.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: []
				// , idHints: ''
			}
		);
	}

	async chatInputRun(interaction) {
		const embed = await this.createInviteEmbed();
		return interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		const embed = await this.createInviteEmbed();
		return reply(message, { embeds: [embed] });
	}

	async createInviteEmbed() {
		return new Promise(async (resolve, reject) => {
			const embed = new EmbedBuilder()
				.setTitle('Invite')
				.setDescription('[Invite me to your server](https://discord.com/api/oauth2/authorize?client_id=796034058740170813&permissions=387136&scope=bot%20applications.commands)')
				.setColor(global.COLORS.DEFAULT);
			return resolve(embed);
		});
	}
}
