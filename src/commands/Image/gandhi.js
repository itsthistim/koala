import { Command } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";
import { createCanvas, loadImage, registerFont } from "canvas";
import { wrapText } from "#lib/canvas";

registerFont("src/lib/assets/fonts/LibreBaskerville-Italic.ttf", {
	family: "Libre Baskerville Italic"
});

export class GandhiCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "gandhi",
			aliases: ["ghandi"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Makes Gandhi say something.",
			detailedDescription: "",
			usage: "<text>",
			examples: ["Pee pee poo poo"]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName("text").setDescription("The text to put on the quote.").setRequired(true));
		});
	}

	async chatInputRun(interaction) {
		let text = interaction.options.getString("text");

		const image = await this.createImage(text);
		return interaction.reply({ files: [image] });
	}

	async messageRun(message, args) {
		let text = await args.rest("string").catch(() => null);
		if (!text) return reply(message, "You need to provide some text to put on the quote.");

		const image = await this.createImage(text);
		return reply(message, { files: [image] });
	}

	async createImage(quote) {
		const base = await loadImage("src/lib/assets/images/gandhi-quote.png");
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext("2d");

		ctx.drawImage(base, 0, 0);
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.font = "50px Libre Baskerville Italic";
		ctx.fillStyle = "white";

		let fontSize = 50;

		while (ctx.measureText(quote).width > 945) {
			fontSize--;
			ctx.font = `${fontSize}px Libre Baskerville Italic`;
		}

		const lines = await wrapText(ctx, quote, 270);
		const topMost = 180 - ((fontSize * lines.length) / 2 + (20 * (lines.length - 1)) / 2);

		for (let i = 0; i < lines.length; i++) {
			const height = topMost + (fontSize + 20) * i;
			ctx.fillText(lines[i], 395, height);
		}

		let attachment = canvas.toBuffer();
		if (Buffer.byteLength(attachment) > 8e6) return `Error: The image was too large to send.`;
		return {
			attachment: attachment,
			name: "gandhi.png"
		};
	}
}
