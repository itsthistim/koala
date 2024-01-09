import { Command } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage, registerFont } from 'canvas';
import moment from 'moment';

registerFont('src/lib/assets/fonts/OLD.ttf', { family: 'Old English Text MT' });

export class CertificateCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'certificate',
			aliases: ['certify'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Creates a certificate for a user.',
			detailedDescription: '',
			usage: '<user> [reason]',
			examples: ['@user#1234', '@user#1234 being great']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) => option.setName('name').setDescription('The name to put on the certificate.').setRequired(true))
					.addStringOption((option) => option.setName('reason').setDescription('The text for the certificate.').setRequired(true));
			},
			{
				guildIds: [],
				idHints: '1115020564420100118'
			}
		);
	}

	async chatInputRun(interaction) {
		let name = interaction.options.getString('name');
		let reason = interaction.options.getString('reason');

		let result = await this.createImage(name, reason);
		if (typeof result === 'string') return reply(interaction, result);
		return reply(interaction, { files: [result] });
	}

	async messageRun(message, args) {
		let name = await args.pick('string').catch(() => message.guild.members.cache.get(message.guild.ownerId).user.username);
		let reason = await args.rest('string').catch(() => `Inviting ${this.container.client.user.username} to the server`);

		let result = await this.createImage(name, reason);
		if (typeof result === 'string') return reply(message, result);
		return reply(message, { files: [result] });
	}

	async createImage(name, reason) {
		try {
			const base = await loadImage('src/lib/assets/images/certificate.png');

			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');

			ctx.drawImage(base, 0, 0);
			ctx.font = '30px Old English Text MT';
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';
			ctx.fillText(reason, 518, 273);
			ctx.fillText(name, 518, 419);
			ctx.fillText(moment().format('MM/DD/YYYY'), 309, 503);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: 'certificate.png'
			};
		} catch (err) {
			console.error(err);
			return `Something went wrong. Please try again later.`;
		}
	}
}
