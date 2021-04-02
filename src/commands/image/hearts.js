const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { createCanvas, loadImage } = require('canvas');
const { drawImageWithTint, shortenText } = require('../../util/Canvas');
const path = require('path');

module.exports = class HeartsCommand extends Command {
    constructor() {
        super('hearts', {
            aliases: ['hearts', 'love'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will draw hearts over a members profile picture or image.',
                usage: '<imageUrl | member>'
            },
        })
    }

    *args() {
        const image = yield {
            type: 'image',
            default: msg => msg.author.displayAvatarURL({ format: 'png', size: 512 }),
            prompt: {
                start: 'Please provide a valid image or user.',
                retry: 'Please provide a valid image or user. Try again!',
                optional: true
            }
        };

        return { image };
    }

    async exec(msg, { image }) {    
        try {
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'hearts.png'));
            const avatar = await loadImage(image);

			const canvas = createCanvas(avatar.width, avatar.height);
			const ctx = canvas.getContext('2d');
			drawImageWithTint(ctx, avatar, 'deeppink', 0, 0, avatar.width, avatar.height);
			ctx.drawImage(base, 0, 0, avatar.width, avatar.height);
			return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'hearts.png' }] });

		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}