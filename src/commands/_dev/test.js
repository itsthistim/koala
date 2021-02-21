const { Command, Argument } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const {
    Message
} = require('discord.js');
const Canvas = require('canvas');
const Discord = require('discord.js');

module.exports = class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            // args: [
			// 	{
			// 		id: 'member',
			// 		type: 'member',
			// 		prompt: {
			// 			start: `Please provide a member to mute.`,
			// 			retry: `Please provide a **valid** member to mute.`
			// 		}
			// 	},
			// 	{
			// 		id: 'reason',
			// 		type: 'string',
			// 		match: 'rest',
			// 		default: 'No reason provided.'
			// 	}
			// ],
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    *args() {
        const msg = yield {
            type: 'message',
            match: 'phrase',
            prompt: {
                start: 'React to what?',
                retry: 'Please provide a valid message. Try again!',
                optional: false
            }
        };

        // test#2 for new update webhook

        const emoji = yield {
            type: Argument.union('emoji', 'string'),
            match: 'phrase',
            prompt: {
                start: 'React with what?',
                retry: 'Please provide a valid emoji. Try again!',
                optional: false
            }
        };

        return { msg, emoji };
    }

    async exec(message, { msg, emoji }) {
        message.delete();
        msg.react(emoji);
    }
}
