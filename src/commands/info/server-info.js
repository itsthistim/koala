const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class GuildInfoCommand extends Command {
    constructor() {
        super('guild-info', {
            aliases: ['server-info', 'guild-info', 's-info', 'g-info'],
            category: 'Info',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Shows some information about the guild.',
                usage: ''
            }
        })
    }

    async exec(msg) {
        const embed = this.client.util.embed()
        .setColor(global.gcolors[0])
        .setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
        .setThumbnail(msg.guild.iconURL({ dynamic: true }))
        .addField(`People`, `Owner: <@${msg.guild.ownerID}>\nMembers: ${10}🧑 ${10}🤖 | ${20}\nBoosts: ${msg.guild.premiumSubscriptionCount} (Level: ${msg.guild.premiumTier})`)
        .addField(`Technical`, `Roles: ${msg.guild.roles.cache.size}\nChannels: ${msg.guild.channels.cache.size}\nRegion: ${msg.guild.region}\nID: \`${msg.guild.id}\`${msg.guild.vanityURLCode != null ? `\nVanityURL: ${msg.guild.vanityURLCode}` : ''}`)
        
        return msg.util.send(embed);
    }
}