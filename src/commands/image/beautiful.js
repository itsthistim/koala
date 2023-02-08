import { Command } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { CanvasUtil } from '#lib/canvas';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

registerFont('src/lib/assets/fonts/MinecraftRegular-Bmg3.otf', {
	family: 'Minecraftia'
});

export class BeautifulCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'beautiful',
			aliases: ['beauty'],
			requiredUserPermissions: [],
			requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Gravity Falls\' "Oh, this? This is beautiful." meme.',
			detailedDescription: '',
			usage: '[user|image url]',
			examples: ['@user#1234']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addStringOption((option) => option.setName('url').setDescription('The image url to use.').setRequired(false))
					.addUserOption((option) => option.setName('user').setDescription('The user avatar to use.').setRequired(false));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627429249646664'
			}
		);
	}

	async chatInputRun(interaction) {
		let image = (await interaction.options.getUser('user'))?.displayAvatarURL({ extension: 'png', size: 512 }) ??
					(await interaction.options.getString('url')) ??
					interaction.user.displayAvatarURL({ extension: 'png', size: 512 });

		let attachment = await this.createImage(image);
		if (typeof attachment === 'string') return reply(interaction, attachment);
		return interaction.reply({ files: [attachment] });
	}

	async messageRun(message, args) {
		let image = await args.pick('member').catch(() => args.pick('image').catch(() => message.author.displayAvatarURL({ extension: 'png', size: 512 })));
		if (typeof image === 'object') {
			image = image.displayAvatarURL({ extension: 'png', size: 512 });
		}

		let attachment = await this.createImage(image);
		if (typeof attachment === 'string') return reply(message, attachment);

		return reply(message, { files: [attachment] });
	}

	async createImage(image) {
		try {
			const base = await loadImage('src/lib/assets/images/beautiful.png');
			const data = await loadImage(image);

			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(data, 249, 24, 105, 105);
			ctx.drawImage(data, 249, 223, 105, 105);
			ctx.drawImage(base, 0, 0);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: 'beautiful.png'
			};
		} catch (err) {
			return `Error: Invalid image provided. Please make sure the image is a valid image url and has a valid file extension.\nValid file extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`raw\`, \`.svg\``;
		}
	}
}
