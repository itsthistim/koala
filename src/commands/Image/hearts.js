import { Command } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";
import { createCanvas, loadImage } from "canvas";
import { drawImageWithTint } from "#lib/canvas";

export class HeartsCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "hearts",
			aliases: ["heart"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Puts hearts on your avatar or an image.",
			detailedDescription: "",
			usage: "[user|image url]",
			examples: ["@user#1234", "https://example.com/image.png"]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName("user").setDescription("The user to draw the avatar of.").setRequired(false))
				.addStringOption((option) => option.setName("url").setDescription("The image url to draw.").setRequired(false));
		});
	}

	async chatInputRun(interaction) {
		let image =
			(await interaction.options.getUser("user"))?.displayAvatarURL({
				extension: "png",
				size: 512
			}) ??
			(await interaction.options.getString("url")) ??
			interaction.user.displayAvatarURL({ extension: "png", size: 512 });

		let attachment = await this.createImage(image);

		if (typeof attachment === "string") {
			return interaction.reply(attachment);
		} else {
			return interaction.reply({ files: [attachment] });
		}
	}

	async messageRun(message, args) {
		let image = await args.pick("member").catch(() => args.pick("image").catch((err) => message.author.displayAvatarURL({ extension: "png", size: 512 })));
		if (typeof image === "object") image = image.user.displayAvatarURL({ extension: "png", size: 512 });

		const result = await this.createImage(image);
		if (typeof result === "string") return reply(message, result);
		return message.channel.send({ files: [result] });
	}

	async createImage(image) {
		try {
			const base = await loadImage("src/lib/assets/images/hearts.png");
			const data = await loadImage(image);

			const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext("2d");
			drawImageWithTint(ctx, data, "deeppink", 0, 0, data.width, data.height);
			ctx.drawImage(base, 0, 0, data.width, data.height);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: "hearts.png"
			};
		} catch (err) {
			console.error(err);
			return `Error: Invalid image provided. Please make sure the image is a valid image url and has a valid file extension.\nValid file extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`raw\`, \`.svg\``;
		}
	}
}
