import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { CanvasUtil } from '#lib/canvas';

registerFont('src/lib/assets/fonts/MinecraftRegular-Bmg3.otf', {
	family: 'Minecraftia'
});

export class AchievementCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'achievement',
			aliases: ['advancement'],
			requiredUserPermissions: [],
			requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Send a minecraft advancement with any text.',
			detailedDescription: '',
			usage: '[text]',
			examples: ['Invite koala!']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env == 'PRODUCTION' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addStringOption((option) => option.setName('text').setDescription('The text to put on the achievement').setRequired(true));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627426003267664'
			}
		);
	}

	async chatInputRun(interaction) {
		const text = (await interaction.options.getString('text')) ?? `Invite ${this.container.client.user.username}!`;

		let attachment = await this.createImage(text);
		interaction.reply({ files: [attachment] });
	}

	async messageRun(message, args) {
		const text = await args.rest('string').catch(() => `Invite ${this.container.client.user.username}!`);

		let attachment = await this.createImage(text);
		reply(message, { files: [attachment] });
	}

	async createImage(text) {
		try {
			const base = await loadImage('src/lib/assets/images/achievement.png');
			const canvas = createCanvas(base.width, base.height);

			const ctx = canvas.getContext('2d');
			ctx.drawImage(base, 0, 0);
			ctx.font = '20px Minecraftia';
			ctx.fillStyle = '#ffff00';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(CanvasUtil.shortenText(ctx, text, 250), 60, 50);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: 'achievement.png'
			};
		} catch (err) {
			console.log(err);
		}
	}
}
