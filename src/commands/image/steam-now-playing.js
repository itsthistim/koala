const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { shortenText, drawImageWithTint  } = require('../../util/Canvas');
const path = require('path');
registerFont(path.join(__dirname, '..', '..', 'util', 'assets', 'fonts', 'NotoSansJP-Regular.otf'), { family: 'Noto' });

module.exports = class SteamNowPlayingCommand extends Command {
    constructor() {
        super('steam-now-playing', {
            aliases: ['steam-now-playing', 'steam'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Will show a member play anything you want.',
                usage: '<member> <game>'
            },
        })
    }

    *args() {
        const u = yield {
            type: 'member',
            default: msg => msg.guild.members.cache.get(msg.author.id),
            prompt: {
                start: 'Please provide a valid image.',
                retry: 'Please provide a valid image. Try again!',
                optional: true
            }
        };

        const game = yield {
            type: 'string',
            match: 'rest',
            prompt: {
                start: 'Please provide a valid text.',
                retry: 'Please provide a valid text. Try again!',
                optional: false
            }
        };

        return { u, game };
    }

    async exec(msg, { u, game }) {    
        try {
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'steam-now-playing.png'));
            const avatar = await loadImage(u.user.displayAvatarURL({ format: 'png', size: 64 }));
            
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(base, 0, 0);
			ctx.drawImage(avatar, 26, 26, 41, 42);
			ctx.fillStyle = '#90b93c';
			ctx.font = '14px Noto';
			ctx.fillText(u.user.username, 80, 34);
			ctx.fillText(shortenText(ctx, game, 200), 80, 70);
			return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'steam-now-playing.png' }] });
		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}