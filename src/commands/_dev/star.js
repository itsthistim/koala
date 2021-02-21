const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class StarCommand extends Command {
    constructor() {
        super('star', {
            aliases: ['star'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            args: [
                {
                    id: 'message',
                    match: 'phrase',
                    type: 'message'
                },
                {
                    id: 'remove',
                    match: 'flag',
                    flag: ['-remove', '-r']
                }
            ],
            description: {
                content: 'Star a message.',
                usage: ''
            },
        })
    }

    async exec(msg, { message, remove }) {
        msg.delete();
        if (remove) {
            const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(this.client.user.id));
            try {
                for (const reaction of userReactions.values()) {
                    await reaction.users.remove(this.client.user.id);
                }
            } catch (error) {
                console.error('Failed to remove reactions.');
            }
        }
        else {
            message.react('⭐');
        }
    }
}