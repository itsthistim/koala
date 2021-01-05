const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class TweetCommand extends Command {
    constructor() {
        super('tweet', {
            aliases: ['tweet'],
            category: 'Text',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

*args() {
    const text = yield {
        type: 'string',
        match: 'text',
        prompt: {
            start: 'What do you want to tweet?',
            retry: 'Please provide a valid text. Try again!',
            optional: false
        }
    };
    
    return { text };
}

    async exec(msg, args) {
        const embed = this.client.util.embed()
            .setAuthor(msg.author.username, msg.author.avatarURL({dynamic: true}))
            .setDescription(`${args.text}`)
            .setFooter(`@${msg.author.username} on Twitter`, "http://pluspng.com/img-png/twitter-logo-png-twitter-logo-vector-png-clipart-library-518.png")
            .setColor("#1DA1F2");
        return msg.util.send(embed);

    }
}