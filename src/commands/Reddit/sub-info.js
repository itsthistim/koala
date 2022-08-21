const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');

module.exports = class SubInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'sub-info',
            aliases: ['sub-info', 'subinfo', 'sub'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Gets all kinds of information about a subreddit.',
                usage: '<subreddit>',
                examples: ['memes', 'politics']
            },
            detailedDescription: ''
        });
    }

    async messageRun(msg, args) {
        var subreddit = await args.pick('string').catch(() => null);

        if (!subreddit) return reply(msg, "Please provide a subreddit!");

        try {
            let embed = new MessageEmbed();
            let sub = await this.getReddit(subreddit);

            let utc_creationdate = sub.created_utc;
            let creationdate = new Date(0);
            creationdate.setUTCSeconds(utc_creationdate);

            const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
            const [{ value: mo }, , { value: da }, , { value: ye }] = dtf.formatToParts(creationdate);

            embed.setTitle(sub.title ? sub.title : `Here is what I found about ${sub.display_name_prefixed}!`);
            embed.setURL(`https://reddit.com/${sub.url}`);

            if (sub.public_description) {
                embed.addField(`About`, sub.public_description);
            }

            embed.addField(`Info`, `🍰 Created: ${da}. ${mo} ${ye}\n🙊 Language: ${sub.lang}\n${sub.over18 ? '🔞 This subreddit is NSFW!' : ''}`, true);
            embed.addField(`Members`, `👋 Active users: ${sub.active_user_count}\n🌟 Subscribers: ${sub.subscribers}`, true);
            embed.setColor(global.COLORS.DEFAULT);
            embed.setTimestamp();
            embed.setFooter({ text: `Requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) });

            if (!sub.over_18) {
                embed.setThumbnail(sub.icon_img);
            }

            reply(msg, { embeds: [embed] });
        } catch (error) {
            let embed = new MessageEmbed()
                .setColor(global.COLORS.DEFAULT)
                .setDescription('❌ ' + error);
            return reply(msg, { embeds: [embed] });
        }
    }

    /**
* Validates, if a subreddit exists and returns it
* @param {String} subreddit
*/
    async getReddit(subreddit) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/about.json`);
        if (res.length === 0) {
            return false;
        } else {
            return res.data.data;
        }
    }
}