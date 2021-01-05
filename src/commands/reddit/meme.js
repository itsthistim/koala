const { Command } = require('discord-akairo');
const { get } = require('axios');
const moment = require('moment');

module.exports = class MemeCommand extends Command {
    constructor() {
        super('meme', {
            aliases: ['meme'],
            category: 'Reddit',
            typing: true,
            prefix: [global.gprefixes[0], global.gprefixes[1], '!'],
			description: {
				content: 'Sends a random meme from Reddit!'
			}
        });
    }

    async exec(msg) {
        
        msg.delete({ timeout: 5000 });
        let embed = this.client.util.embed();
        
        let subredditArr = await this.randomFromArray(['memes', 'dankmemes']);
        let post = await this.getReddit(subredditArr);
        let srcPostURL = post.url;
        let srcURL = srcPostURL.replace('.gifv', '.gif');

        while (post.is_video || post.over_18 || !post.post_hint === 'image' || post.stickied) {
            post = await this.getReddit(subredditArr);
        }

        embed.setTitle(post.title);
        embed.setURL(`https://reddit.com${post.permalink}`);
        embed.setImage(srcURL);
    
        embed.setColor('RANDOM');
        embed.setFooter(`👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`, msg.author.avatarURL({dynamic: true}));
    
        msg.channel.send({ embed });
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    */
    async getReddit(subreddit) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/top.json?t=month`);
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