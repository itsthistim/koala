const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
var parse = require('parse-duration')

module.exports = class SeekCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'seek',
            aliases: ['seek'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Seeks a specific time in seconds in a song.',
                usage: '<time>',
                examples: ['80']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        var time = await args.pick('number').catch(async() => await args.pick('string').catch(() => null));
        const queue = PLAYER.getQueue(message.guild.id);

        if (!queue || !queue.playing) return reply(message, 'There is no song playing.');
        if (!time) return reply(message, 'You must provide a valid time.');

        const duration = typeof time === 'string' ? parse(time) : time * 1000;

        // if(typeof time === 'string'){
        //     duration = parse(time)
        // } else {
        //     duration = time * 1000
        // }

        if (!duration) return reply(message, 'You must provide a valid time.');
        if (duration >= queue.current.durationMS) return reply(message, 'That time is out of range.');

        await queue.seek(duration);
        return message.delete().catch(() => { });
    }
}