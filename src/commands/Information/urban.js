import { container, Command } from "@sapphire/framework";
import { reply } from "@sapphire/plugin-editable-commands";
import { EmbedLimits } from "@sapphire/discord-utilities";
import { EmbedBuilder } from "discord.js";
import { StringUtil } from "#lib/util";
import axios from "axios";
import moment from "moment";

export class UrbanCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "urban",
			aliases: ["urban-dictionary"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Looks up a word on Urban Dictionary.",
			detailedDescription: "",
			usage: "<word>",
			examples: ["koala"]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName("word").setDescription("The word to look up.").setRequired(true));
		});
	}

	async chatInputRun(interaction) {
		const query = interaction.options.getString("word", true);

		const definition = await this.getDefinition(query);
		const embed = await this.getInfoEmbed(definition, query);
		return interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		const query = await args.rest("string").catch(() => "koala");

		const definition = await this.getDefinition(query);
		const embed = await this.getInfoEmbed(definition, query);
		return reply(message, { embeds: [embed] });
	}

	async getInfoEmbed(definition, word = definition.word) {
		if (!definition) {
			return new EmbedBuilder().setColor(COLORS.RED).setDescription(`No definition found for **${word}**.`);
		}

		return new Promise(async (resolve, reject) => {
			const embed = new EmbedBuilder()
				.setColor(container.colors.DEFAULT)
				.setTitle(definition.word)
				.setURL(definition.permalink)
				.setDescription(StringUtil.fitTo(definition.definition.replace(/\[|\]/g, ""), EmbedLimits.MaximumDescriptionLength, true))
				.addFields(
					{
						name: "Example",
						value: `${StringUtil.fitTo(definition.example.replace(/\[|\]/g, ""), EmbedLimits.MaximumFieldValueLength, true)}\u200B`,
						inline: false
					},
					{ name: "👍", value: `${definition.thumbs_up}\u200B`, inline: true },
					{ name: "👎", value: `${definition.thumbs_down}\u200B`, inline: true }
				)
				.setFooter({
					text: `${definition.author}  •  ${moment(definition.written_on).format("MMM Do YYYY, h:mm a")}`
				});

			return resolve(embed);
		});
	}

	async getDefinition(query) {
		return new Promise(async (resolve, reject) => {
			const url = `https://api.urbandictionary.com/v0/define?term=${query}`;
			const response = await axios.get(url);

			if (response.data.list.length === 0) {
				return resolve(null);
			}

			let list = response.data.list;

			// sort the list by the number of thumbs up
			list.sort((a, b) => {
				return b.thumbs_up - a.thumbs_up;
			});

			return resolve(list[0]);
		});
	}
}
