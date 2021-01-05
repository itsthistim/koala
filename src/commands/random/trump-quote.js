const { Command } = require('discord-akairo');
const { get } = require("snekfetch");
const Logger = require('../../util/logger.js');


module.exports = class TrumpTweetCommand extends Command {
    constructor() {
        super('trump-quote', {
            aliases: ['trump-quote', 'trump-q', 'q-trump', 'trump-tweet', 'tweet-trump', 'trump-t', 't-trump'],
            category: 'Random',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
                content: 'Makes trump tweet something about anyone in the server.',
                usage: '<user>'
            },
        })
    }

    *args() {
        const user = yield {
            type: 'user',
            match: 'phrase',
            prompt: {
                start: 'Who should trump tweet at?',
                retry: 'Please provide a valid user. Try again!',
                optional: false
            }
        };

        return { user };
    }

    async exec(msg, { user }) {
        const { body } = await get(`https://api.whatdoestrumpthink.com/api/v1/quotes/personalized?q=${encodeURI(user)}`)
            .catch(() => msg.say('Something went wrong... If this problem persists get in touch with <@319183644331606016>'));

        if (!body || !body.message) throw msg.language.get("ER_TRY_AGAIN");
        const embed = this.client.util.embed()
            .setAuthor('Donald J. Trump', 'https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m.jpg')
            .setDescription(`${body.message}!`)
            .setFooter('@realDonaldTrump on Twitter', "http://pluspng.com/img-png/twitter-logo-png-twitter-logo-vector-png-clipart-library-518.png")
            .setColor("#1DA1F2");
        return msg.util.send(embed);
    }
}