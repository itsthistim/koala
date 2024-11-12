import { container, Command } from "@sapphire/framework";
import { send, reply } from "@sapphire/plugin-editable-commands";
import { EmbedBuilder } from "discord.js";
import axios from "axios";

export default class InspireCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "inspire",
			aliases: ["inspire"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			subCommands: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Provides an inspirational quote for you.",
			detailedDescription: "",
			usage: "",
			examples: [""]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description);
		});
	}

	async chatInputRun(interaction) {
		const embed = await this.getQuoteEmbed();
		interaction.reply({ embeds: [embed] });
	}

	async messageRun(msg, args) {
		const embed = await this.getQuoteEmbed();
		reply(msg, { embeds: [embed] });
	}

	async getQuoteEmbed() {
		const res = await axios.get(`https://inspirobot.me/api?generate=true`);
		const embed = new EmbedBuilder()
			.setColor(container.colors.DEFAULT)
			.setTitle(`Inspirational quote`)
			.setURL(res.data)
			.setImage(res.data)
			.setFooter({ text: `Powered by https://inspirobot.me/` });
		return embed;
	}
}
