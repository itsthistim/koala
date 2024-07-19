import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { CanvasUtil } from '#lib/util';

export class RossCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'ross',
			aliases: ['bob-ross', 'bobross'],
			requiredUserPermissions: [],
			requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Makes Bob Ross draw an image or an avatar.',
			detailedDescription: '',
			usage: '[user|image url]',
			examples: ['@user#1234']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription('The user to draw the avatar of.').setRequired(false))
				.addStringOption((option) => option.setName('url').setDescription('The image url to draw.').setRequired(false));
		});
	}

	async chatInputRun(interaction) {
		let image =
			(await interaction.options.getUser('user'))?.displayAvatarURL({ extension: 'png', size: 512 }) ??
			(await interaction.options.getString('url')) ??
			interaction.user.displayAvatarURL({ extension: 'png', size: 512 });

		let attachment = await this.createImage(image);

		if (typeof attachment === 'string') {
			return interaction.reply(attachment);
		} else {
			return interaction.reply({ files: [attachment] });
		}
	}

	async messageRun(message, args) {
		let image = await args.pick('member').catch(() => args.pick('image').catch((err) => message.author.displayAvatarURL({ extension: 'png', size: 512 })));

		if (typeof image === 'object') {
			image = image.displayAvatarURL({ extension: 'png', size: 512 });
		}

		let attachment = await this.createImage(image);

		if (typeof attachment === 'string') {
			return reply(message, attachment);
		} else {
			return reply(message, { files: [attachment] });
		}
	}

	async createImage(image) {
		try {
			const base = await loadImage('src/lib/assets/images/bob-ross.png');
			const data = await loadImage(image);

			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = '#f0e8d3';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(data, 15, 23, 440, 440);
			ctx.drawImage(base, 0, 0);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: 'bob-ross.png'
			};
		} catch (err) {
			return `Error: Invalid image provided. Please make sure the image is a valid image url and has a valid file extension.\nValid file extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`raw\`, \`.svg\``;
		}
	}
}
