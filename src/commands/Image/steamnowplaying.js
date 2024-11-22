import { container, Command } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";
import { createCanvas, loadImage } from "canvas";
import { shortenText } from "#lib/canvas";

export class SteamNowPlayingCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "steamnowplaying",
			aliases: ["steam-now-playing", "steam-nowplaying", "steam-now-playing", "steam"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Shows the currently playing game of a Steam user",
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
				.addUserOption((option) => option.setName("user").setDescription("The user to draw the avatar of.").setRequired(true))
				.addStringOption((option) => option.setName("game").setDescription("The game for the user to play.").setRequired(true));
		});
	}

	async chatInputRun(interaction) {
		const member = await interaction.options.getMember("user");
		const game = await interaction.options.getString("game");

		const attachment = await this.createImage(member.user, game);

		if (typeof attachment === "string") return interaction.reply(attachment);
		return interaction.reply({ files: [attachment] });
	}

	async messageRun(message, args) {
		const member = await args.pick("member");
		const game = await args.rest("string").catch(() => "a game");

		console.log(member.user.username, game);

		const attachment = await this.createImage(member.user, game);

		if (typeof attachment === "string") return reply(message, attachment);
		return message.channel.send({ files: [attachment] });
	}

	async createImage(user, game) {
		try {
			const base = await loadImage("src/lib/assets/images/steam-now-playing.png");
			const data = await loadImage(user.displayAvatarURL({ extension: "png", size: 512 }));

			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext("2d");
			ctx.drawImage(base, 0, 0);
			ctx.drawImage(data, 26, 26, 41, 42);
			ctx.fillStyle = "#90b93c";
			ctx.font = "14px Sans";
			ctx.fillText(user.username, 80, 34);
			ctx.fillText(shortenText(ctx, game, 200), 80, 70);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
			return {
				attachment: attachment,
				name: "steam-now-playing.png"
			};
		} catch (err) {
			console.error(err);
			return `Error: Invalid image provided. Please make sure the image is a valid image url and has a valid file extension.\nValid file extensions: \`.png\`, \`.jpg\`, \`.jpeg\`, \`raw\`, \`.svg\``;
		}
	}
}
