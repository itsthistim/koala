const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = class BeautifulCommand extends Command {
    constructor() {
        super('beautiful', {
            aliases: ['beautiful'],
            category: '',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    *args() {
        const user = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'Who is beautiful?',
                retry: 'Please provide a valid user. Try again!',
                optional: true
            },
            default: msg => msg.guild.members.cache.get(msg.author.id)
        };
        
        return { user };
    }

    async exec(msg, { user: u }) {
        
        const avatarURL = u.user.avatarURL({ format: 'png', size: 128 });
		try {
            // const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'beautiful.png'));
            const base = await loadImage("https://media.discordapp.net/attachments/502208815937224718/804092347440168960/beautiful.png");
            
            // const { body } = await request.get(avatarURL);
			// const avatar = await loadImage(body);
            
            const avatar = await loadImage(u.user.avatarURL({format: 'png'}));

            const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(avatar, 249, 24, 105, 105);
			ctx.drawImage(avatar, 249, 223, 105, 105);
			ctx.drawImage(base, 0, 0);
			return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'beautiful.png' }] });
		} catch (err) {
			return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
    }
}