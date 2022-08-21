const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');


module.exports = class UnmuteCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'unmute',
            aliases: ['unmute'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Unmute a user.',
                usage: '<user> [reason]',
                examples: ['@User Reason for unmute']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        var member = await args.pick('member').catch(() => null);
        var reason = await args.rest('string').catch(() => null);

        if (!member) {
            return reply(message, 'You must specify a member to unmute.');
        }

        if(member.moderatable) {
            member.timeout(null, `Unmuted by ${message.author.tag}${reason ? `: ${reason}` : ''}`);
            return reply(message, `Unmuted ${member.user.tag}${reason ? ` for \`${reason}\`` : ''}.`);
        } else {
            return reply(message, `I am unable to unmute ${member.user.tag}.`);
        }
    }
}