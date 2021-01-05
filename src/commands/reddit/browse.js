const { Argument, Command } = require('discord-akairo');
const { get } = require('axios');
const moment = require('moment');

module.exports = class BrowseCommand extends Command {
    constructor() {
        super('browse', {
            aliases: ['browse', 'b'],
            category: 'Reddit',
            typing: true,
            description: {
                content: 'Gets posts of any subreddit with any given filter and time mode.\nTime modes: `hour`, `day`, `week`, `month`, `year` or `all`.\nFilters: `top`, `best`, `hot` or `new`.',
                usage: '<subreddit> [filter] [time_mode]',
                examples: ['memes', 'politics day', 'r/discordapp hot week']
            }
        });
    }

    *args() {
        const subreddit = yield {
            type: 'string',
            match: 'phrase',
            unordered: false,
            prompt: {
                start: 'What subreddit do you want the top post to be from?',
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

        try {
            let embed = this.client.util.embed();
            let post = await this.getReddit(args.subreddit, args.filter, args.time);

            let tries = 0;
            while ((post.is_video || post.stickied) || (!msg.channel.nsfw && post.over_18) || (post.selftext && post.selftext.length > 1900)) {
                post = await this.getReddit(args.subreddit, args.filter, args.time);
                if (tries > 5) {
                    return msg.util.send("**Couldn't find a valid post!**\nIf you provided a NSFW subreddit please try again in a NSFW channel!")
                }
                tries++;
            }

            if (post.selftext) {
                embed.setDescription(post.selftext);
            }

            if (post.url && !post.selftext) {
                let srcPostURL = post.url;
                let srcURL = srcPostURL.replace('.gifv', '.gif');
                embed.setImage(srcURL);
            }

            embed.setTitle(post.title);
            embed.setURL(`https://reddit.com${post.permalink}`);
            embed.setColor('RANDOM');
            embed.setFooter(`👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`, msg.author.avatarURL({ dynamic: true }));

            msg.util.send({ embed });
        } catch (error) {
            let embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setDescription(`❌${error}`);

            return msg.util.send({ embed });
        }
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    * @param {String} filter
    * @param {String} time
    */
    async getReddit(subreddit, filter, time) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/${filter}.json?t=${time}`);
        if (res.data.data.children.length === 0) {
            return false;
        } else {
            let max = [];
            max = res.data.data.children.map(i => i.data.ups);
            const rand = Math.floor(Math.random() * max.length);
            const post = res.data.data.children.filter(i => i.data.ups === max[rand]);

            return post[0].data;
        }
    }
}