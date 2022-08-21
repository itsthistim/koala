const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');


module.exports = class HackCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'hack',
            aliases: ['hack'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Hack a user',
                usage: '[user]',
                examples: ['', '@User#1234']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        // message.delete().catch(() => {});
        var target = await args.pick('member').catch(() => message.guild.members.cache.get(message.author.id));
        let mostCommonWords = [
            'lmao',
            'lol',
            'uwu',
            ':)',
            'poop',
            'owo',
            'xD',
            'rawr',
            'rofl'
        ];

        let passwords = [
            '123456',
            'iLostMyPoOps0ck12',
            'p0opSOck',
            'PA55W0RD',
            '1234'
        ];

        let ipAddresses = [
            '127.0.0.1:0420',
            '10.0.0.2:6969',
            '127.4.20.69:3600',
            '27.0.0.1:2752'
        ];

        let stolenEmojis = [
            '<a:PepeSweat:759176146520244274>',
            '<a:pepecaught:706966001350213653>',
            '<a:pepecaught:706966001350213653>',
            '<a:pepecaught:706966001350213653>',
            '<a:blink:706966000888840292>',
            '<a:bongocat:803701017803489290>',
            '<a:lookaway:800122508992839681>',
            '<a:lookaway:800122508992839681>',
            '<a:PepeJedi:759176138403872789>'
        ];

        let messages = [
            `[▖] Scraping Discord account...`,
            `[▘] Found:\nE-Mail: \`xX${target.user.username.replace(/\s+/g, '')}IsCoolXx@hotmail.com\`\nPassword: \`${passwords[Math.floor(Math.random() * passwords.length)]}\``,
            `[▝] Finding most common word...`,
            `[▗] const mostCommon = "${mostCommonWords[Math.floor(Math.random() * mostCommonWords.length)]}"`,
            `[▖] Fetching dms with closest friends (if there are any friends at all)`,
            `[▘] Injecting virus.....`,
            `[▝] Stealing emojis ${stolenEmojis[Math.floor(Math.random() * stolenEmojis.length)]}`,
            `[▗] Fetching IP address...`,
            `[▖] Found: \`${ipAddresses[Math.floor(Math.random() * ipAddresses.length)]}\``,
            `**Finished** hacking user \`${target.user.username}\``
        ]

        let i = 0;
        let msg = await send(message, `Hacking user \`${target.user.username}\`...`)

        setInterval(function () {
            msg.edit(messages[i]);
            i++;
        }, 2000);
    }
}