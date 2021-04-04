const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class MoveCommand extends Command {
    constructor() {
        super('move', {
            aliases: ['move'],
            category: 'Utility',
            userPermissions: ['MOVE_MEMBERS'],
            clientPermissions: ['MOVE_MEMBERS', 'MANAGE_CHANNELS'],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Moves a user to a voice channel.',
                usage: '<user> <voice channel>'
            },
        })
    }

    *args() {
        const userToMove = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'What user do you want to move?',
                retry: 'Please provide a valid user. Try again!',
                optional: false,
                ordered: false
            }
        };

        const vc = yield {
            type: 'voiceChannel',
            match: 'phrase',
            prompt: {
                start: 'What channel do you want the user to move to?',
                retry: 'Please provide a valid voice channel. Try again!',
                optional: false,
                ordered: false
            }
        };
        
        return { userToMove, vc };
    }

    async exec(msg, args) {
        if (args.userToMove.voice.channel != null) {
            if (args.vc != args.userToMove.voice.channel) {
                args.userToMove.voice.setChannel(args.vc);
            } else {
                msg.channel.send("The user is already in this voice channel.")
            }
        } else {
            msg.channel.send("The user is currently not in a voice channel.");
        }
    }
}