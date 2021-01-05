const { Argument, Command } = require('discord-akairo');
const { get } = require('axios');

module.exports = class SubInfoCommand extends Command {
    constructor() {
        super('subinfo', {
            aliases: ['sub-info'],
            category: 'Reddit',
            typing: true,
            args: [
                {
                    id: 'subreddit',
                    match: 'phrase',
                    type: 'string',
                    prompt: {
                        start: 'What subreddit do you want to get information on?',
                        retry: 'Please provide a valid subreddit. Try again!'
                    }
                }
            ],
            description: {
                content: 'Gets all kinds of information of a subreddit.',
                usage: '<subreddit>',
                examples: ['memes', 'politics']
            }
        });
    }

    async exec(msg, args) {

        try {
            let embed = this.client.util.embed();
            let sub = await this.getReddit(args.subreddit, args.time);

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
            embed.setColor('#FF4300');
            embed.setTimestamp();
            embed.setFooter(`Requested by ${msg.author.tag}`, msg.author.avatarURL({ dynamic: true }));

            if (!sub.over_18) {
                embed.setThumbnail(sub.icon_img);
            }

            msg.util.send({ embed });
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
    */
    async getReddit(subreddit, time) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/about.json`);
        if (res.length === 0) {
            return false;
        } else {
            return res.data.data;
        }
    }
}