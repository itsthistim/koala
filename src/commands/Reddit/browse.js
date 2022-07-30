const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');
const moment = require('moment');


module.exports = class BrowseCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'browse',
            aliases: ['browse', 'b'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Gets posts of any subreddit with any given filter and time mode.',
                usage: '<subreddit> [filter] [time mode]',
                examples: ['memes', 'politics day', 'r/discordapp hot week']
            },
            detailedDescription: '\nTime modes: `hour`, `day`, `week`, `month`, `year` or `all`.\nFilters: `top`, `best`, `hot` or `new`.'
        });
    }

    async messageRun(msg, args) {
        // create enum for filters
        const filters = {
            top: 'top',
            best: 'best',
            hot: 'hot',
            new: 'new'
        };

        // create enum for time modes
        const timeModes = {
            hour: 'hour',
            day: 'day',
            week: 'week',
            month: 'month',
            year: 'year',
            all: 'all'
        };

        var subreddit = await args.pick('string').catch(() => null);
        var filter = await args.pick('enum', { enum: filters }).catch(() => 'top');
        var time = await args.pick('enum', { enum: timeModes }).catch(() => 'all');

        try {
            let embed = new MessageEmbed();
            let post = await this.getPost(subreddit, filter, time);

            let tries = 0;
            while ((post.is_video || post.stickied) || (!msg.channel.nsfw && post.over_18) || (post.selftext && post.selftext.length > 1900)) {
                post = await this.getPost(subreddit, filter, time);
                if (tries > 5) {
                    return reply(msg, "**Couldn't find a valid post!**\nIf you provided a NSFW subreddit please try again in a NSFW channel!")
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
            embed.setFooter({ text: `👍 ${post.ups} | 👤 u/${post.author} | 📆 ${moment.unix(post.created).format('DD MMM YYYY')}`, icon_url: msg.author.displayAvatarURL({ dynamic: true }) });

            return reply(msg, { embeds: [embed] });
        } catch (error) {
            console.log(error);
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
        const res = await get(`https://www.reddit.com/r/${sub}/${filter}/.json?t=${time}`);
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