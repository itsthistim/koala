const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { MersenneTwister19937, integer } = require('random-js');


module.exports = class PenisCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'penis',
            aliases: ['penis', 'pp'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Determines a user\'s penis length!',
                usage: '@User',
                examples: ['']
            },
            detailedDescription: '\nThe results are calculated using your user id as a seed. This is why the result stays the same every single time.'
        });
    }

    async messageRun(message, args) {
        var member = await args.pick('member').catch(() => message.member);
        
        const random = MersenneTwister19937.seed(member.id);
        const length = integer(3, 30)(random);
        return reply(message, `${member.user.username}'s ${message.channel.nsfw ? "penis" : "pp"} size is ${length}cm.`)
    }
}

// 3, 27 -> 26
// 3, 30 -> 26