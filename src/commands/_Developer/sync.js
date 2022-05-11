const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class SyncCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'sync',
            aliases: ['sync'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Synchonizes permissions with parent channel.',
                usage: '',
                examples: ['']
            }
        });
    }

    async messageRun(message, args) {
        let channels = message.guild.channels.cache;
        channels.forEach(channel => {
            if (channel.parent) {
                channel.lockPermissions().catch(console.error);
            }
        });

        reply(message, { embeds: [{ description: `${EMOJIS.POSITIVE} Syncronized all permissions with their parent.`, color: COLORS.GREEN }] });
    }
}