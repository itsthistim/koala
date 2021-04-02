const { Command, Argument } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { Message } = require('discord.js');
const Canvas = require('canvas');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const GIFEncoder = require('gifencoder');
const frameCount = 31;

module.exports = class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            // args: [
			// 	{
			// 		id: 'member',
			// 		type: 'member',
			// 		prompt: {
			// 			start: `Please provide a member to mute.`,
			// 			retry: `Please provide a **valid** member to mute.`
			// 		}
			// 	},
			// 	{
			// 		id: 'reason',
			// 		type: 'string',
			// 		match: 'rest',
			// 		default: 'No reason provided.'
			// 	}
			// ],
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    // *args() {
    //     const image = yield {
    //         type: 'image',
    //         default: msg => msg.author.displayAvatarURL({ format: 'png', size: 512 }),
    //         prompt: {
    //             start: 'Please provide a valid image.',
    //             retry: 'Please provide a valid image. Try again!',
    //             optional: true
    //         }
    //     };
    //     return { image };
    // }

    async exec(msg, { image }) {        


        let attmsg = msg.channel.messages.cache.get('825514833935859722');
        let att = attmsg.attachments.array();
        let res = "";

        for (let i = 0; i < att.length; i++) {
            res += att[i].url + "\n"
        }
        
        msg.channel.send(res);
		// try {            
        //     const base = await loadImage(path.join(__dirname, '..', '..', 'util', 'assets', 'images', 'beautiful.png'));
        //     const avatar = await loadImage(image);
            
        //     const encoder = new GIFEncoder(base.width, base.height);
        //     const canvas = createCanvas(base.width, base.height);
		// 	const ctx = canvas.getContext('2d');
        //     const stream = encoder.createReadStream();
        //     encoder.start();
        //     encoder.setRepeat(0);
        //     encoder.setDelay(100);
        //     encoder.setQuality(200);
            
        //     for (let i = 0; i < frameCount; i++) {
        //         const frameID = `frame-${i.toString().padStart(2, '0')}.png`;
		// 		const frame = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'fire', frameID));
		// 		const ratio = frame.width / frame.height;
		// 		const height = Math.round(avatar.width / ratio);

        //         ctx.drawImage(frame, 0, avatar.height - height, avatar.width, height);
        //         encoder.addFrame(ctx);
        //     }

            
		// 	ctx.fillStyle = 'white';
		// 	ctx.fillRect(0, 0, base.width, base.height);
		// 	ctx.drawImage(avatar, 249, 24, 105, 105);
		// 	ctx.drawImage(avatar, 249, 223, 105, 105);
		// 	ctx.drawImage(base, 0, 0);
		// 	return msg.util.send({ files: [{ attachment: canvas.toBuffer(), name: 'beautiful.png' }] });
		// } catch (err) {
		// 	return msg.util.send(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		// }
    }
}
