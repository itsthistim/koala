const {
    Command
} = require('discord-akairo');
const Logger = require('../../util/logger.js');
const {
    Message
} = require('discord.js');
const Canvas = require('canvas');
const Discord = require('discord.js');

module.exports = class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test'],
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

    // *args() {
    //     const spamrole = yield {
    //         type: 'role',
    //         match: 'text',
    //         prompt: {
    //             start: 'What role do you want to spam?',
    //             retry: 'Please provide a valid role. Try again!',
    //         }
    //     };

    //     return {
    //         spamrole
    //     };
    // }

    *args() {
        const u = yield {
            type: 'user',
            match: 'phrase',
            prompt: {
                start: 'Who is a happy little accident?',
                retry: 'Please provide a valid u. Try again!',
                optional: false
            }
        };

        return { u };
    }

    async exec(message, { u }) {
        //message.delete({ timeout: 5000 })
        // message.util.send("Spam starts in 20 seconds...")
        // var interval = setInterval (function () {
        //     message.channel.send(`<@&${spamrole.id}>`)
        //     .catch(console.error); // add error handling here
        // }, 20 * 1000);

        const base = await Canvas.loadImage('https://media.discordapp.net/attachments/502208815937224718/762102918203179008/bob-ross.png?width=524&height=677');

        const { body } = u.displayAvatarURL({ format: 'png' });
        const avatar = await loadImage(body);

        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f0e8d3';
        ctx.fillRect(0, 0, base.width, base.height);
        ctx.drawImage(avatar, 15, 20, 440, 440);
        ctx.drawImage(base, 0, 0);

        ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'bob-ross.png');

        message.util.send("Hi", attachment);
    }
}