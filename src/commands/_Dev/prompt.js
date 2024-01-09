import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import axios from 'axios';

export class PromptCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'prompt',
			aliases: [],
			requiredUserPermissions: [PermissionFlagsBits.BanMembers],
			requiredClientPermissions: [PermissionFlagsBits.BanMembers],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Prompts ChatGPT.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	async messageRun(message, args) {
		var prompt = await args.rest('string').catch(() => null);

		console.log('Making GPT-3 API request...');

		const openai_api_key = process.env.OPENAI_API_KEY;
		const openai_url = 'https://api.openai.com/v1/engines/davinci-codex/completions';

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${openai_api_key}`
		};

		if (!prompt) {
			message.reply('Please provide a prompt for the AI.');
			return;
		}

		// Configure the GPT-3 API request
		const data = {
			prompt: prompt,
			max_tokens: 100,
			n: 1,
			stop: null,
			temperature: 0.5,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0
		};
		console.log('Making GPT-3 API request...');

		try {
			console.log('Making GPT-3 API request...');
			// Make the API request
			const response = await axios.post(openai_url, data, { headers: headers });

			// Extract the AI-generated text
			const aiText = response.data.choices[0].text.trim();

			console.log(response.data.choices[0].text.trim());

			// Send the AI-generated text as a message
			reply(message, aiText);
		} catch (error) {
			console.error('Error making GPT-3 API request:', error);
			message.reply('There was an error processing your request. Please try again later.');
		}
	}
}
