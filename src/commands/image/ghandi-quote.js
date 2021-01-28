const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class GhandiQuoteCommand extends Command {
    constructor() {
        super('gandhi-quote', {
            aliases: ['ghandi-quote', 'ghandi', 'gandhi'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will make Mahatma Gandhi say what you want.',
                usage: '<text>'
            },
        })
    }

    *args() {
        const quote = yield {
            type: 'string',
            match: 'text',
            prompt: {
                start: 'Please provide a quote.',
                retry: 'Please provide a valid quote. Try again!',
                optional: false
            }
        };

        return { quote };
    }

    async exec(msg, { quote }) {
        // const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gandhi-quote.png'));

        registerFont(path.join(__dirname, '../../util/assets/fonts/LibreBaskerville-Italic.ttf'), { family: 'Libre Baskerville Italic' });

        const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'gandhi-quote.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
        
        ctx.drawImage(base, 0, 0);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.font = '50px Libre Baskerville Italic';
		ctx.fillStyle = 'white';
        
        let fontSize = 50;
        
        while (ctx.measureText(quote).width > 945) {
			fontSize--;
			ctx.font = `${fontSize}px Libre Baskerville Italic`;
		}
        
        const lines = await this.wrapText(ctx, quote, 270);
		const topMost = 180 - (((fontSize * lines.length) / 2) + ((20 * (lines.length - 1)) / 2));
        
        for (let i = 0; i < lines.length; i++) {
			const height = topMost + ((fontSize + 20) * i);
			ctx.fillText(lines[i], 395, height);
		}
        
        return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'gandhi-quote.png' }] });
    }

    wrapText(ctx, text, maxWidth) {
        return new Promise(resolve => {
            if (ctx.measureText(text).width < maxWidth) return resolve([text]);
            if (ctx.measureText('W').width > maxWidth) return resolve(null);
            
            const words = text.split(' ');
            const lines = [];
            let line = '';
            
            while (words.length > 0) {
                let split = false;
                while (ctx.measureText(words[0]).width >= maxWidth) {
                    const temp = words[0];
                    words[0] = temp.slice(0, -1);
                    if (split) {
                        words[1] = `${temp.slice(-1)}${words[1]}`;
                    } else {
                        split = true;
                        words.splice(1, 0, temp.slice(-1));
                    }
                }
                
                if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
                    line += `${words.shift()} `;
                } else {
                    lines.push(line.trim());
                    line = '';
                }
                
                if (words.length === 0) lines.push(line.trim());
            }
            
            return resolve(lines);
        });
    }
}

