import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { ClientUtil } from '#lib/functions';
import axios from 'axios';

export class DefineCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'define',
			aliases: ['wiktionary', 'dictionary', 'dict', 'def', 'definition'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Defines a word using Wiktionary.',
			detailedDescription: '',
			usage: '<word>',
			examples: ['koala']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env === 'production' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addStringOption((option) => option.setName('word').setDescription('The word to define.').setRequired(true));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627602205978704'
			}
		);
	}

	async chatInputRun(interaction) {
		const word = await interaction.options.getString('word');

		const embed = await this.createInfoEmbed(word);
		return interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		const word = await args.rest('string');

		const embed = await this.createInfoEmbed(word);
		return reply(message, { embeds: [embed] });
	}

	async createInfoEmbed(word) {
		return new Promise(async (resolve, reject) => {
			const definition = await this.getDefinition(word);

			if (!definition) {
				return resolve(
					new EmbedBuilder().setTitle(`${word}`).setColor(global.COLORS.DEFAULT).setDescription('No definition found.\nYou can try the search again at a later time or head to the web instead.')
				);
			}

			const embed = new EmbedBuilder().setTitle(`Definition of ${word}`).setColor(global.COLORS.DEFAULT);

			definition[0].meanings.forEach((meaning) => {
				embed.addFields({
					name: `As ${ClientUtil.getIndefiniteArticle(meaning.partOfSpeech)} ${meaning.partOfSpeech}`,
					value: meaning.definitions[0].definition
				});
			});

			return resolve(embed);
		});
	}

	async getDefinition(word) {
		try {
			const response = await axios.get(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)
					.replace(/!/g, '%21')
					.replace(/'/g, '%27')
					.replace(/\(/g, '%28')
					.replace(/\)/g, '%29')
					.replace(/\*/g, '%2A')
					.replace(/%20/g, '+')}`
			);
			return response.data;
		} catch (err) {
			console.log(err);
			return null;
		}
	}
}
