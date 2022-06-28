const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { MersenneTwister19937, integer } = require('random-js');


module.exports = class IqCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'iq',
            aliases: ['iq'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Determines a user\'s IQ!',
                usage: '@User',
                examples: ['']
            },
            detailedDescription: '\nThe results are calculated using your user id as a seed. This is why the result stays the same every single time.'
        });
    }

    async messageRun(message, args) {
        var member = await args.pick('member').catch(() => message.member);

        const random = MersenneTwister19937.seed(member.id);
        const score = integer(35, 228)(random);
        return reply(message, `${member.user.username}'s IQ score is ${score}.`)
    }
}