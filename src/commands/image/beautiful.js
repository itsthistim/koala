const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class BeautifulCommand extends Command {
    constructor() {
        super('beautiful', {
            aliases: ['beautiful'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Draw an image over over Gravity Falls\' "Oh, this? This is beautiful." meme.',
                usage: '<imageUrl | member>'
            },
        })
    }

    *args() {
        const image = yield {
            type: 'image',
            default: msg => msg.author.displayAvatarURL({ format: 'png', size: 128 }),
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
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'beautiful.png'));
            const data = await loadImage(image);
            
            const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(data, 249, 24, 105, 105);
			ctx.drawImage(data, 249, 223, 105, 105);
			ctx.drawImage(base, 0, 0);
			return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'beautiful.png' }] });
		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}