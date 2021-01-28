const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { shortenText } = require('../../util/Canvas');
const path = require('path');
registerFont(path.join(__dirname, '..', '..', 'util', 'assets', 'fonts', 'Minecraftia-Regular.ttf'), { family: 'Minecraftia' });


module.exports = class AchievementCommand extends Command {
    constructor() {
        super('achievement', {
            aliases: ['achievement'],
            category: '',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Send a minecraft achievement with any text.',
                usage: '<text>'
            },
        })
    }

*args() {
    const text = yield {
        type: 'string',
        match: 'text',
        prompt: {
            start: 'What should the achievement be?',
            retry: 'Please provide a valid text. Try again!',
            optional: false
        }
    };
    
    return { text };
}

    async exec(msg, { text }) {        
		try {            
            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'achievement.png'));
            const canvas = createCanvas(base.width, base.height);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(base, 0, 0);
            ctx.font = '17px Minecraftia';
            ctx.fillStyle = '#ffff00';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(shortenText(ctx, text, 230), 60, 61);
            return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'achievement.png' }] });
        } catch (error) {
            return msg.util.send(`Something went wrong... \`${error.message}\``);
        }
    }
}