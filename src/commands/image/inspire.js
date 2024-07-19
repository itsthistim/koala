import { Command, CommandOptionsRunTypeEnum, BucketScope } from '@sapphire/framework';
import { send, reply } from '@sapphire/plugin-editable-commands';
import { Time } from '@sapphire/time-utilities';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';

export default class InspireCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'inspire',
			aliases: ['inspire'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			subCommands: [],
			flags: [],
			options: [],
			nsfw: false,
			description: {
				content: 'Provides an inspirational quote for you.',
				usage: '',
				examples: ['']
			},
			detailedDescription: ''
		});
	}

	// TODO: chatInput support

	async messageRun(msg, args) {
		let quote = await this.getQuote();
		let embed = new EmbedBuilder();
		embed.setColor(Math.floor(Math.random() * (0xffffff + 1)));
		embed.setTitle(`Inspirational quote`);
		embed.setURL(quote);
		embed.setImage(quote);
		embed.setFooter({ text: `Powered by https://inspirobot.me/` });

		reply(msg, { embeds: [embed] });
	}

	async getQuote() {
		const res = await axios.get(`https://inspirobot.me/api?generate=true`);
		return res.data;
	}
}
