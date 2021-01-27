const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class HandsCommand extends Command {
    constructor() {
        super('hands', {
            aliases: ['hands', 'hand'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will make a user raise their hands in a threatening way.',
                usage: '<member>'
            },
        })
    }

    *args() {
        const u = yield {
            type: 'member',
            match: 'phrase',
            default: msg => msg.guild.members.cache.get(msg.author.id),
            prompt: {
                start: 'Please provide a user.',
                retry: 'Please provide a valid user. Try again!',
                optional: true
            }
        };

        return { u };
    }

    async exec(msg, { u }) {    
        try {
            const base = await loadImage("https://cdn.discordapp.com/attachments/502208815937224718/804113450481352704/hands.png");
            const data = await loadImage(u.user.avatarURL({format: 'png', size: 128 }));

			const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(data, 0, 0);
			const ratio = data.width / base.width;
			const height = base.height * ratio;
			ctx.drawImage(base, 0, data.height - height, data.width, height);
			const attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e+6) return msg.util.send('Resulting image was above 8 MB.');
			return msg.util.send({ files: [{ attachment, name: 'hands.png' }] });
		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}