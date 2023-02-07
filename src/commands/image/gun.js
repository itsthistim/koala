import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { CanvasUtil } from '#lib/canvas';

export class GunCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'gun',
			aliases: ['shoot'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Puts a gun over an avatar or an image',
			detailedDescription: '',
			usage: '[user|image url]',
			examples: ['@user#1234', 'https://example.com/image.png']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addUserOption((option) => option.setName('user').setDescription('The user to draw the avatar of.').setRequired(false))
					.addStringOption((option) => option.setName('url').setDescription('The image url to draw.').setRequired(false));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627512196218910'
			}
		);
	}

	async chatInputRun(interaction) {
		let image =
			(await interaction.options.getUser('user'))?.displayAvatarURL({
				format: 'png',
				size: 512
			}) ??
			(await interaction.options.getString('url')) ??
			interaction.user.displayAvatarURL({ format: 'png', size: 512 });

		let attachment = await this.createImage(image);

		if (typeof attachment === 'string') {
			return interaction.reply(attachment);
		} else {
			return interaction.reply({ files: [attachment] });
		}
	}

	async messageRun(message, args) {
		let image = await args.pick('member').catch(() => args.pick('image').catch((err) => message.author.displayAvatarURL({ format: 'png', size: 512 })));
		if (typeof image === 'object') image = image.user.displayAvatarURL({ format: 'png', size: 512 });

		const result = await this.createImage(image);
		if (typeof result === 'string') return reply(message, result);
		return message.channel.send({ files: [result] });
	}

	async createImage(image) {
		try {
			const base = await loadImage('src/lib/assets/images/gun.png');
			const data = await loadImage(image);

			const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(data, 0, 0);
			const ratio = data.height / 2 / base.height;
			const width = base.width * ratio;
			ctx.drawImage(base, data.width - width, data.height - data.height / 2, width, data.height / 2);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: 'gun.png'
			};
		} catch (err) {
			console.log(err);
			return `Error: Invalid image provided. Please make sure the image is a valid image url and has a valid file extension.\nValid file extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`raw\`, \`.svg\``;
		}
	}
}
