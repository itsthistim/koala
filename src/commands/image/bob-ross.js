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
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will make Bob Ross paint a picture.',
                usage: '<user>'
            },
        })
    }

    *args() {
        const u = yield {
            type: 'user',
            match: 'phrase',
            default: msg => msg.author,
            prompt: {
                start: 'Please provide a user.',
                retry: 'Please provide a valid u. Try again!',
                optional: true
            }
        };

        return { u };
    }

    async exec(msg, { u }) {
        try {
            const base = await loadImage("https://media.discordapp.net/attachments/502208815937224718/762102918203179008/bob-ross.png?width=524&height=677");
            //const base = await loadImage(path.join('dirname__', '..', '..', 'util', 'assets', 'images', 'bob-ross.png'));
            //const base = await loadImage('../../util/assets/images/bob-ross.png');
            const avatar = await loadImage(u.avatarURL({format: 'png'}));
            const canvas = createCanvas(base.width, base.height);
            const ctx = canvas.getContext('2d');
            

            ctx.fillStyle = '#f0e8d3';
            ctx.fillRect(0, 0, base.width, base.height);
            ctx.drawImage(avatar, 15, 20, 440, 440);
            ctx.drawImage(base, 0, 0);

            return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'bob-ross.png' }] });
        } catch (error) {
            return msg.channel.send(`Something went wrong... \`${error.message}\``);
        }
    }
}