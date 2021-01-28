const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class BobRossCommand extends Command {
    constructor() {
        super('bob-ross', {
            aliases: ['bob-ross', 'ross'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will make Bob Ross paint a picture.',
                usage: '<imageUrl | member>'
            },
        })
    }

    *args() {
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
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'bob-ross.png'));
            const avatar = await loadImage(image);

            const canvas = createCanvas(base.width, base.height);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f0e8d3';
            ctx.fillRect(0, 0, base.width, base.height);
            ctx.drawImage(avatar, 15, 23, 440, 440);
            ctx.drawImage(base, 0, 0);
            return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'bob-ross.png' }] });
        } catch (error) {
            return msg.channel.send(`Something went wrong... \`${error.message}\``);
        }
    }
}