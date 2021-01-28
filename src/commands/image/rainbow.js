const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class RainbowCommand extends Command {
    constructor() {
        super('rainbow', {
            aliases: ['rainbow', 'gay'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will show a members profile picture behind a rainbow.',
                usage: '<member>'
            },
        })
    }

    *args() {
        // const u = yield {
        //     type: 'member',
        //     match: 'phrase',
        //     default: msg => msg.guild.members.cache.get(msg.author.id),
        //     prompt: {
        //         start: 'Please provide a user.',
        //         retry: 'Please provide a valid user. Try again!',
        //         optional: true
        //     }
        // };

        // return { u };

        const image = yield {
            type: 'image',
            default: msg => msg.author.avatarURL({ format: 'png', size: 128 }),
            prompt: {
                start: 'Please provide a valid image.',
                retry: 'Please provide a valid image. Try again!',
                optional: true
            }
        };

        return { image };
    }

    async exec(msg, { image }) {    
        try {
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'rainbow.png'));
            const data = await loadImage(image);
            
            const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(data, 0, 0);
			ctx.drawImage(base, 0, 0, data.width, data.height);
			const attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e+6) return msg.util.send('Resulting image was above 8 MB.');
			return msg.util.send({ files: [{ attachment, name: 'rainbow.png' }] });
		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}