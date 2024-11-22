import { container, Command } from "@sapphire/framework";
import { PermissionFlagsBits } from "discord.js";
import { reply } from "@sapphire/plugin-editable-commands";
import { createCanvas, loadImage, registerFont } from "canvas";
import { shortenText } from "#lib/canvas";

registerFont("src/lib/assets/fonts/Mojangles.ttf", { family: "Mojangles" });

export class AchievementCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "achievement",
			aliases: ["advancement"],
			requiredUserPermissions: [],
			requiredClientPermissions: [PermissionFlagsBits.AttachFiles],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Send a minecraft advancement with any text.",
			detailedDescription: "",
			usage: "[text]",
			examples: ["Invite koala!"]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName("text").setDescription("The text to put on the achievement").setRequired(true));
		});
	}

	async chatInputRun(interaction) {
		const text = (await interaction.options.getString("text")) ?? `Invite ${container.client.user.username}!`;

		let attachment = await this.createImage(text);
		interaction.reply({ files: [attachment] });
	}

	async messageRun(message, args) {
		const text = await args.rest("string").catch(() => `Invite ${container.client.user.username}!`);

		let attachment = await this.createImage(text);
		reply(message, { files: [attachment] });
	}

	async createImage(text) {
		try {
			const base = await loadImage("src/lib/assets/images/achievement.png");
			const canvas = createCanvas(base.width, base.height);

			const ctx = canvas.getContext("2d");
			ctx.drawImage(base, 0, 0);
			ctx.font = "20px Mojangles";
			ctx.fillStyle = "#ffff00";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(shortenText(ctx, text, 250), 60, 50);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: "achievement.png"
			};
		} catch (err) {
			console.error(err);
		}
	}
}
