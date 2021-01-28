const { Argument, Command } = require('discord-akairo');
const { get } = require('axios');
const moment = require('moment');

module.exports = class ScrollCommand extends Command {
    constructor() {
        super('scroll', {
            aliases: ['scroll', 's'],
            category: 'Reddit',
            typing: true,
            ownerOnly: true,
            description: {
                content: 'Scroll through a subreddit!',
                usage: '<subreddit> [filter] [time_mode]',
                examples: ['memes', 'politics day', 'r/discordapp top month']
            }
        });
    }

    *args() {
        const subreddit = yield {
            type: 'string',
            match: 'phrase',
            unordered: false,
            prompt: {
                start: 'What subreddit do you want the posts to be from?',
                retry: 'Please provide a valid subreddit. Try again!'
            }
        };

        const filter = yield {
            type: [
                ['top', 't'],
                ['best', 'b'],
                ['hot', 'h'],
                ['new', 'n']
            ],
            match: 'phrase',
            unordered: true,
            default: 'top',
            prompt: {
                start: 'What time mode do you want to apply to the top post?\nOne of: `hour`, `day`, `week`, `month`, `year` or `all`.',
                retry: 'Please provide a valid time mode. Try again!\nOne of: `hour`, `day`, `week`, `month`, `year` or `all`.',
                optional: true
            }
        }

        const time = yield {
            type: [
                ['hour', 'now', 'h', 'n'],
                ['day', 'today', 'daily', 'd'],
                ['week', 'weekly', 'w'],
                ['month', 'monthly', 'm'],
                ['year', 'yearly', 'y'],
                ['all', 'alltime', 'all-time', 'all time', 'a']
            ],
            match: 'phrase',
            unordered: true,
            default: 'all',
            prompt: {
                start: 'What time mode do you want to apply to the top post?\nOne of: `hour`, `day`, `week`, `month`, `year` or `all`.',
                retry: 'Please provide a valid time mode. Try again!\nOne of: `hour`, `day`, `week`, `month`, `year` or `all`.',
                optional: true
            }
        }

        return { subreddit, filter, time };
    }

    async exec(msg, args) {

        // getPost(sub, filter, time)
        // validatePost(post)
        // sendPost(post)

        var post = await this.getPost(args.subreddit, args.filter, args.time);
        post = await this.validatePost(msg, post);

        var i = 0;
        var postMsg = await this.sendPost(msg, post);

        try {
            await postMsg.react('⬅');
            await postMsg.react('➡');
            await postMsg.react('🛑');

            const filter = (reaction, user) => (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡' || reaction.emoji.name === '🛑') && user === msg.author;

            const collector = postMsg.createReactionCollector(filter, { time: 300000 });
            collector.on('collect', async r => {
                switch (r.emoji.name) {
                    case '🛑':
                        collector.stop();
                        i = 0;
                        break;
                    case '⬅':
                        msg.util.send("LEFT");
                        i--;

                        post = await this.getPost(args.subreddit, args.filter, args.time);
                        postMsg = await this.sendPost(msg, post);

                        break;
                    case '➡':
                        msg.util.send("RIGHT");
                        i++;

                        post = await this.getPost(args.subreddit, args.filter, args.time);
                        postMsg = await this.sendPost(msg, post);
                        break;
                }
            });

            collector.on('end', collected => {
                postMsg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                msg.channel.send(i);
            });
        } catch (error) {
            let embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setDescription('❌ ' + error);

            return msg.util.send({ embed });
        }

    }

    /**
    * Validates a post
    * @param {String} msg
    * @param {String} post
    */
    async validatePost(msg, post) {
        let tries = 0;
        while (((post.is_video || post.stickied) || (!msg.channel.nsfw && post.over_18) || (post.selftext && post.selftext.length > 1900)) && tries <= 5) {
            post = await this.getPost(args.subreddit, args.filter, args.time);
            tries++;
        }

        if (tries > 5) {
            msg.util.send("**Couldn't find a valid post!**\nIf you provided a NSFW subreddit please try again in a NSFW channel!");
        }

        return post;
    }

    /**
    * Formats a JSON post to embed and sends it
    * @param {String} msg
    * @param {String} post
    */
    async sendPost(msg, post) {
        try {
            let embed = this.client.util.embed();

            if (post.url) {
                let srcPostURL = post.url;
                var srcURL = srcPostURL.replace('.gifv', '.gif');
            }

            if (post.selftext) {
                embed.setDescription(post.selftext);
            }
            else {
                embed.setImage(srcURL);
            }

            embed.setTitle(post.title);
            embed.setURL(`https://reddit.com${post.permalink}`);
            embed.setColor('RANDOM');
            embed.setFooter(`👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`, msg.author.displayAvatarURL({ dynamic: true }));

            let postMsg = await msg.util.send({ embed });
            return postMsg;

        } catch (error) {
            let embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setDescription('❌ ' + error);

            return msg.util.send({ embed });
        }
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    * @param {String} filter
    * @param {String} time
    */
    async getPost(subreddit, filter, time) {

        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/${filter}.json?t=${time}`);
        if (res.data.data.children.length === 0) {
            return false;
        } else {
            let max = [];
            max = res.data.data.children.map(i => i.data.ups);
            const rand = Math.floor(Math.random() * max.length);
            const post = res.data.data.children.filter(i => i.data.ups > max[rand]);

            return post[0].data;
        }
    }
}