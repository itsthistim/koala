const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const Discord = require('discord.js');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed, User } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class BanCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ban',
            aliases: ['ban', 'b'],
            requiredUserPermissions: ['BAN_MEMBERS'],
            requiredClientPermissions: ['BAN_MEMBERS'],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Bans a user.',
                usage: '<user> [reason]',
                examples: ['@user', '@user breaking rules']
            }
        });
    }

    async messageRun(message, args) {
        let target = await args.pick('member').catch(async () => await args.pick('user').catch(() => null));
        let reason = await args.rest('string').catch(() => null);

        if (!target) return reply(message, 'Please provide a user to ban.');
        if (!target.bannable || target.id == '965000725937684500' || target.id == '319183644331606016' ) return reply(message, 'I cannot ban this user.');


        await message.guild.bans.create(target.id, { reason: reason })
            .then(banInfo => reply(message, `${banInfo.user?.tag ?? banInfo.tag ?? banInfo} has been banned.`))
            .catch(error => reply(message, `An error occurred while banning ${target.tag}.`));
    }
}