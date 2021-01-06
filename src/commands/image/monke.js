const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class MonkeCommand extends Command {
    constructor() {
        super('monke', {
            aliases: ['monke'],
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
        msg.delete();
        msg.util.send('https://cdn.discordapp.com/attachments/502208815937224718/796371361492107285/fcfd49e044a51e6f4c76a6748b8fc2fc.png')
    }
}