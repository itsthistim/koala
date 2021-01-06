const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class DisconnectCommand extends Command {
    constructor() {
        super('disconnect', {
            aliases: ['disconnect', 'dc'],
            category: 'Voice',
            userPermissions: ['MOVE_MEMBERS'],
            clientPermissions: ['MOVE_MEMBERS', 'MANAGE_CHANNELS'],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Disconnects a user from a voice channel.',
                usage: '<user>'
            },
        })
    }

    *args() {
        const userToRemove = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'What user do you want to disconnect?',
                retry: 'Please provide a valid user. Try again!',
                optional: false,
                ordered: false
            }
        };
        
        return { userToRemove };
    }

    async exec(msg, args) {
        if (args.userToRemove.voice.channel != null) {
            args.userToRemove.voice.kick();
        }
        else
        {
            msg.channel.send("The user is currently not in a voice channel.");
        }
    }
}