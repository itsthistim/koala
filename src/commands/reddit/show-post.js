const { Command, Argument } = require('discord-akairo');
const { get } = require('axios');
const moment = require('moment');

module.exports = class ShowPostCommand extends Command {
    constructor() {
        super('show-post', {
            aliases: ['show-post', 'preview-post', 'post-preview', 'sp'],
            category: 'Reddit',
            typing: true,
            prefix: [global.gprefixes[0], global.gprefixes[1], '!'],
            ownerOnly: true,
			description: {
                content: 'Shows the preview of a reddit post!',
                usage: '<link_to_post>'
			}
        });
    }

    *args() {
        const link = yield {
            type: Argument.validate('string', (msg, phrase, val) => this.getReddit(val)),
            match: 'text',
            prompt: {
                start: 'Now tell me the link of the post!\nExample: `https://www.reddit.com/r/subreddit/comments/5gn8ru/this_doesnt_actually_exist/`',
                retry: 'Please provide a valid link!\nExample: `https://www.reddit.com/r/subreddit/comments/5gn8ru/this_doesnt_actually_exist/`',
                optional: false
            }
        };
        
        return { link };
    }

    async exec(msg, { link }) {
        
        // msg.delete({ timeout: 5000 });
        let embed = this.client.util.embed();
        
        let subredditArr = await this.randomFromArray(['memes', 'dankmemes']);

        let post = await this.getReddit(subredditArr);
        msg.channel.send(post);
        console.log(post);
        
        // let srcPostURL = post.url;
        // let srcURL = srcPostURL.replace('.gifv', '.gif');

        // while (post.is_video || post.over_18 || !post.post_hint === 'image' || post.stickied) {
        //     post = await this.getReddit(subredditArr);
        // }

        embed.setTitle(post.title);
        embed.setURL(`https://reddit.com${post.permalink}`);
        embed.setImage(post.url);
    
        embed.setColor('RANDOM');
        embed.setFooter(`👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`, msg.author.avatarURL({dynamic: true}));
    
        msg.channel.send({ embed });
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    */
    async getReddit(subreddit) {
        const res = await get(`https://www.reddit.com/r/pics/comments/5bx4bx/thanks_obama/.json`);
        if (res.length === 0) {
            return false;
        } else {
            return res.data[0].data.children;
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