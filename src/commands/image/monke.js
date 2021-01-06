const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class MonkeCommand extends Command {
    constructor() {
        super('monke', {
            aliases: ['monke', 'monkey'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 1,
            ratelimit: 1,
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
                content: 'Sends monke.',
                usage: ''
            },
        })
    }

    async exec(msg, args) {
        msg.util.send('https://media.discordapp.net/attachments/502208815937224718/796373812320403456/ab67616d0000b27382137f3ea7c9f2957d07e00b.png');
        msg.react('🐒');
    }
}