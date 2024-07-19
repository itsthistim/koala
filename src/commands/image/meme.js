import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import axios from 'axios';
import moment from 'moment';

export class MemeCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'meme',
			aliases: ['meme'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Sends a meme from Reddit.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder.setName(this.name).setDescription(this.description);
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply();
		const embed = await this.getMeme(interaction);
		return await interaction.editReply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		const embed = await this.getMeme(message);
		return await reply(message, { embeds: [embed] });
	}

	async getMeme(interaction) {
		const subreddits = ['memes', 'dankmemes'];
		const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
		const { data } = await axios.get(`https://www.reddit.com/r/${subreddit}/top/.json?t=month`);

		const is_over_18 = interaction.channel.nsfw;
		const min_ups = 1;

		const posts = data.data.children
			.filter((post) => (is_over_18 ? true : !post.data.over_18))
			.filter((post) => !post.data.is_video)
			.filter((post) => post.data.post_hint === 'image')
			.filter((post) => !post.data.stickied)
			.filter((post) => post.data.ups > min_ups);

		// TODO: improve randomization of posts by using a better algorithm
		const post = posts[~~(Math.random() * posts.length)]?.data;

		if (!post) return await interaction.editReply({ content: 'No memes found.' });

		const embed = this.buildEmbed(post.title, post.ups, post.permalink, post.created, post.author, post.url, interaction);
		return embed;
	}

	buildEmbed(title, ups, permalink, created, author, url, interaction) {
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(`https://reddit.com${permalink}`)
			.setImage(url)
			.setFooter({ text: `👍 ${ups} | 👤 u/${author} | 📆 ${moment.unix(created).format('DD MMM YYYY')}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });
		return embed;
	}
}
