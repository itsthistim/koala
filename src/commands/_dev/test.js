const { Command, Argument } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { Message } = require('discord.js');
const Canvas = require('canvas');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
// const GIFEncoder = require('gifencoder');
const frameCount = 31;

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
        const color = yield {
            type: 'color',
            match: 'rest',
            prompt: {
                start: 'What color?',
                retry: 'Please provide a valid color. Try again!',
                optional: false
            }
        };
        
        return { color };
    }

    async exec(msg, { color }) {
        let embed = this.client.util.embed()
            .setColor(color)
            .Title(color.ToString() + "<- this might cause problems");

        msg.util.send(embed);
    }
}
