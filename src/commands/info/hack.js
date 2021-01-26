const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class HackCommand extends Command {
    constructor() {
        super('hack', {
            aliases: ['hack'],
            category: '',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Hack a member.',
                usage: '[member]'
            },
        })

        this.running = new Set();
    }

*args() {

    const m = yield {
        type: 'member',
        match: 'phrase',
        prompt: {
            start: 'Who do you want to hack?',
            retry: 'Please provide a valid member. Try again!',
            optional: true,
        },
        default: msg => msg.guild.members.cache.get(msg.author.id)
    };
    
    return { m };
}

async exec(msg, { m }) {
        msg.delete({ timeout: 5000 })
        
        if (this.playing.has(msg.guild.id)) return;
        this.playing.add(msg.guild.id);

        let mostCommonWords = [
            'lmao',
            'lol',
            'uwu',
            ':)',
            'poop',
            'rawr'
        ];

        let passwords = [
            '123456',
            'iLostMyPoOps0ck12',
            'p0opSOck',
            'PA55W0RD'
        ];

        let ipAddresses = [
            '127.0.0.1:2929',
            '764.0.0.2:20146',
            '127.0.0.1:2690', '27.0.0.1:2752'
        ];

        let stolenEmojis = [
            '<a:PepeSweat:759176146520244274>',
            '<a:pepecaught:706966001350213653>',
            '<a:blink:706966000888840292>',
            '<a:bongocat:803701017803489290>',
            '<a:lookaway:800122508992839681>',
            '<a:PepeJedi:759176138403872789>'
        ];

        let messages = [
            `[▖] Scraping Discord account...`,
            `[▘] Found:\nE-Mail: \`xX${m.user.username.replace(/\s+/g, '')}IsCoolXx@hotmail.com\`\nPassword: \`${passwords[Math.floor(Math.random() * passwords.length)]}\``,
            `[▝] Finding most common word...`,
            `[▗] const mostCommon = "${mostCommonWords[Math.floor(Math.random() * mostCommonWords.length)]}"`,
            `[▖] Fetching dms with closest friends (if there are any friends at all)`,
            `[▘] Injecting virus.....`,
            `[▝] Stealing emojis ${stolenEmojis[Math.floor(Math.random() * stolenEmojis.length)]}`,
            `[▗] Fetching IP address...`,
            `[▖] Found: \`${ipAddresses[Math.floor(Math.random() * ipAddresses.length)]}\``,
            `**Finished** hacking user \`${m.user.username}\``
        ]

        let i = 0;
        let message = await msg.util.send(`Hacking user \`${m.user.username}\``)
        
        setInterval(function() {
            message.edit(messages[i]);
            i++;
        }, 2000);

        this.playing.delete(msg.channel.id);
    }
}