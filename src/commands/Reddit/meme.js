const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');
const moment = require('moment');

module.exports = class MemeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'meme',
            aliases: ['meme', 'memes', 'dankmemes', 'r/dankmemes', 'r/dankmemes'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Sends a random meme from reddit.',
                usage: '',
                examples: ['']
            },
            detailedDescription: ''
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => {
            builder.setName(this.name)
            builder.setDescription(this.description.content)
        }, {
            idHints: '995289222124687360',
            behaviorWhenNotIdentical: 'OVERWRITE'
        })
    }

    async chatInputRun(interaction) {
        let data = await this.createMeme();

        let embed = new MessageEmbed()
            .setTitle(data.title)
            .setURL(data.postURL)
            .setImage(data.imageUrl)
            .setColor('RANDOM')
            .setFooter({
                text: data.footer.text
            });

        return interaction.reply({
            embeds: [embed],
            ephemeral: false,
            fetchReply: true,
        })
    }

    async messageRun(msg, args) {
        let data = await this.createMeme();

        console.log(data.title);

        let embed = new MessageEmbed()
            .setTitle(data.title)
            .setURL(data.postURL)
            .setImage(data.imageUrl)
            .setColor('RANDOM')
            .setFooter({
                text: data.footer.text
            });

        return reply(msg, { embeds: [embed] });
    }

    /**
     * Gets a random meme from reddit in an embed
     * @returns Object
     */
    async createMeme() {
        let subredditArr = await this.randomFromArray(['memes', 'dankmemes']);
        let post = await this.getPost(subredditArr);
        let srcPostURL = post.url;
        let srcURL = srcPostURL.replace('.gifv', '.gif');

        let tries = 0;

        while ((post.is_video || post.over_18 || !post.post_hint === 'image' || post.stickied) && tries < 10) {
            post = await this.getPost(subredditArr);
        }

        let data = {
            title: post.title,
            postURL: `https://reddit.com${post.permalink}`,
            imageUrl: srcURL,
            footer: {
                text: `👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`,
                iconURL: `https://seeklogo.com/images/R/reddit-logo-23F13F6A6A-seeklogo.com.png`
            }
        }

        console.log(data.title);

        return data;
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    */
    async getPost(subreddit) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/top/.json`);
        if (res.length === 0) {
            return false;
        } else {
            let max = [];
            max = res.data.data.children.map(i => i.data.ups);

            const rand = Math.floor(Math.random() * max.length);
            const post = res.data.data.children.filter(i => i.data.ups === max[rand]);

            return post[0].data;
        }
    }

    /**
    * Get a random item out of an array
    * @param {Array} array
    */
    async randomFromArray(array) {
        if (Array.isArray(array)) {
            return array[Math.floor(Math.random() * array.length)];
        }
    }
}