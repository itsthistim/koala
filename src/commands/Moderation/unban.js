const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');


module.exports = class UnbanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'unban',
            aliases: ['unban', 'pardon'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Unbans a user from the server.',
                usage: '<user> [reason]',
                examples: ['@user', '@user banned by mistake']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        var target = await args.pick('user').catch(async () => await args.pick('string').catch(() => null));
        var reason = await args.rest('string').catch(() => null);

        if (typeof target == 'string') {
            if (!target.match(/^[0-9]+$/) && target.length > 18) {
                return reply(message, 'Please provide a valid user to unban.');
            }

            target = await this.container.client.users.fetch(target).catch(() => null);
        }

        if (!target) {
            return reply(message, 'Please provide a user to unban.');
        }

        message.guild.bans.remove(target.id, { reason: reason })
            .then(user => reply(message, `${user.username} has been unbanned.`))
            .catch(error => reply(message, `An error occured while unbanning ${target.username}.`));
    }
}