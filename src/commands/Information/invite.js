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
				builder.setName(process.env === 'production' ? this.name : this.name + '-dev').setDescription(this.description);
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1069392996807741571'
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
				.setDescription('[Invite me to your server](https://discord.com/api/oauth2/authorize?client_id=1058725069481844796&permissions=8&scope=bot%20applications.commands)')
				.setColor(global.COLORS.DEFAULT);
			return resolve(embed);
		});
	}
}
