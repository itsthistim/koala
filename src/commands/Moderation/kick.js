const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class KickCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'kick',
            aliases: ['kick'],
            requiredUserPermissions: ['KICK_MEMBERS'],
            requiredClientPermissions: ['KICK_MEMBERS'],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Kicks a user.',
                usage: '<user> [reason]',
                examples: ['@user#1234', '@user#1234 breaking rules']
            }
        });
    }

    async messageRun(message, args) {
        let target = await args.pick('member').catch(() => null);
        let reason = await args.rest('string').catch(() => null);

        if (!target) return reply(message, 'You must provide a user to kick.');
        if (!target.kickable) return reply(message, 'I cannot kick this user.');

        await message.guild.members.kick('84484653687267328', reason)
            .then(banInfo => console.log(`${banInfo.user?.tag ?? banInfo.tag ?? banInfo} has been kicked.`))
            .catch(console.error);
    }
}