const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { MersenneTwister19937, integer } = require('random-js');

module.exports = class IQCommand extends Command {
    constructor() {
        super('iq', {
            aliases: ['iq'],
            category: 'Random',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Determines a user\'s IQ which can range between 20 and 170.',
                usage: '[user]'
            },
        })
    }

    *args() {
        const iqMember = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'What user do you want to know the IQ of?',
                retry: 'Please provide a valid user. Try again!',
                optional: true,
            },
            default: msg => msg.guild.members.cache.get(msg.author.id)
        };
        
        return { iqMember };
    }

    async exec(msg, { iqMember }) {
        const random = MersenneTwister19937.seed(iqMember.user.id);
        const score = integer(20, 170)(random);
        return msg.util.send(`${iqMember.user.username}'s IQ score is ${score}.`)
    }
}