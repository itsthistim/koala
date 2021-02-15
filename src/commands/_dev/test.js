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
        const u = yield {
            type: Argument.union('member', 'user'),
            match: 'rest',
            prompt: {
                start: 'Who is a happy little accident?',
                retry: 'Please provide a valid user. Try again!',
                optional: false
            }
        };

        return { u };
    }

    async exec(message, { u }) {
        message.channel.send(u.id);
    }
}