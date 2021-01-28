const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { shortenText } = require('../../util/Canvas');
const moment = require('moment');
const path = require('path');
registerFont(path.join(__dirname, '..', '..', 'util', 'assets', 'fonts', 'OLD.ttf'), { family: 'Old English Text MT' });


module.exports = class CertificateCommand extends Command {
    constructor() {
        super('certificate', {
            aliases: ['certificate', 'diploma', 'award'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: ['ATTACH_FILES'],
            ignorePermissions: [],
            cooldown: 2000,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Send a custom award to anyone.',
                usage: '<reason> <name>'
            },
        })
    }

    *args() {
        const name = yield {
            type: 'string',
            match: 'phrase',
            prompt: {
                start: 'Who is the certificate for?',
                retry: 'Please provide a valid text. Try again!',
                optional: true
            },
            default: msg => msg.author.username
        };

        const reason = yield {
            type: 'string',
            match: 'rest',
            prompt: {
                start: 'What is the reason for the certificate?',
                retry: 'Please provide a valid text. Try again!',
                optional: false
            }
        };
        
        return { reason, name };
    }

    async exec(msg, { reason, name }) {        
		try {        
            const mentionReg = /<@&(\d{17,19})>/g;
            if(mentionReg.test(name)) {
                name = this.client.util.resolveMember(name, msg.guild.members.cache).user.username;
            }

            const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'certificate.png'));
           
            const canvas = createCanvas(base.width, base.height);
		    const ctx = canvas.getContext('2d');
            
            ctx.drawImage(base, 0, 0);
            ctx.font = '30px Old English Text MT';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.fillText(reason, 518, 273);
            ctx.fillText(name, 518, 419);
            ctx.fillText(moment().format('MM/DD/YYYY'), 309, 503);
            return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'certificate.png' }] });
        } catch (error) {
            return msg.util.send(`Something went wrong... \`${error.message}\``);
        }
    }
}