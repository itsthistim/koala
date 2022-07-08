const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class SusCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sus',
            aliases: ['sus'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'ඞ ඞ ඞ',
                usage: '',
                examples: []
            }
        });
    }

    async messageRun(message, args) {
        try {
            const { MessageEmbed } = require('discord.js');

            let channel = message.guild.channels.cache.get('962035096607678464');

            let embed = new MessageEmbed()
                .setColor(COLORS.RED)
                .setDescription("ඞ ඞ ඞ");

            channel.send({ content: `<@${message.author.id}>`, embeds: [embed] })
            message.delete().catch(() => { });
        } catch (error) {
            reply(message, `ඞ`);
        }

    }
}