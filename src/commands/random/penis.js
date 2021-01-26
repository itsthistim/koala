const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { MersenneTwister19937, integer } = require('random-js');

module.exports = class PenisCommand extends Command {
    constructor() {
        super('penis', {
            aliases: ['penis', 'penis-size', 'pp', 'pp-size'],
            category: 'Random',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Determines a user\'s penis length which can range between 1 and .',
                usage: '[user]'
            },
        })
    }

    *args() {
        const m = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'What user do you want to know the penis size of?',
                retry: 'Please provide a valid user. Try again!',
                optional: true,
            },
            default: msg => msg.guild.members.cache.get(msg.author.id)
        };
        
        return { m };
    }

    async exec(msg, { m }) {
        const random = MersenneTwister19937.seed(m.user.id);
        const score = integer(2, 30)(random);
        return msg.util.send(`${m.user.username}'s ${msg.channel.nsfw ? "penis" : "pp"} size is ${score}.`)
    }
}