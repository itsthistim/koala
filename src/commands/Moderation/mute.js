const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
var moment = require('moment');
var parse = require('parse-duration');
const humanizeDuration = require("humanize-duration");

module.exports = class MuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mute',
            aliases: ['mute', 'temp-mute', 'tempmute', 'time-out', 'timeout'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Timeout a user for a specified amount of time.',
                usage: '<user> <duration> [reason]',
                examples: ['@user 1h Reason for timeout']
            },
            detailedDescription: '\nThis command will timeout a user for a specified amount of time. The duration must be between 1 second and 28 days.'
        });
    }

    async messageRun(message, args) {
        var member = await args.pick('member').catch(() => null);
        var time = await args.pick('string').catch(() => null);
        var reason = await args.rest('string').catch(() => null);

        if (!member) {
            return reply(message, 'You must specify a member to mute.');
        }

        if (member.id === message.author.id) {
            return reply(message, 'You cannot mute yourself.');
        }

        if (!time) {
            return reply(message, 'You must specify a valid duration to mute the user.');
        }

        var duration = parse(time);

        if (!duration) {
            return reply(message, 'You must specify a valid duration to mute the user.');
        }

        if (duration < 1000 || duration >= 2419200000) {
            return reply(message, 'You must specify a duration between 1 second and 27 days.');
        }

        if (member.moderatable) {
            member.timeout(duration, `Muted by ${message.author.tag}${reason ? `: ${reason}` : ''}`);
            reply(message, `${member.user.tag} has been muted for **${humanizeDuration(duration, { units: ['w', 'd', 'h', 'm', 's', 'ms'], conjunction: " and ", serialComma: false })}**${reason ? ` for \`${reason}\`` : ''}.`);
        } else {
            return reply(message, `I am unable to timeout ${member.user.tag}.`);
        }
    }
}