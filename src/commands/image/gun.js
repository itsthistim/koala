const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class GunCommand extends Command {
    constructor() {
        super('gun', {
            aliases: ['gun'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will make anyone hold a gun.',
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
            const base = await loadImage("https://cdn.discordapp.com/attachments/502208815937224718/804110271437078548/gun.png");
            const data = await loadImage(image);
            
            const canvas = createCanvas(data.width, data.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(data, 0, 0);
            const ratio = (data.height / 2) / base.height;
            const width = base.width * ratio;
            ctx.drawImage(base, data.width - width, data.height - (data.height / 2), width, data.height / 2);
            const attachment = canvas.toBuffer();
            if (Buffer.byteLength(attachment) > 8e+6) return msg.util.send('Resulting image was above 8 MB.');
            return msg.util.send({ files: [{ attachment, name: 'gun.png' }] });
        } catch (err) {
            return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
        }   
    }
}