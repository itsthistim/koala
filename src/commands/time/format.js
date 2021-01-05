const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment-timezone');
const mysql = require("mysql2/promise");

module.exports = class FormatCommand extends Command {
    constructor() {
        super('format', {
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
                content: 'No description provided.',
                usage: '<format>'
            },
        })
    }

*args() {
    const format = yield {
        type: [
            ['12h', '12-h', '12', 'am', 'pm', 'am/pm', 'ampm', 'a', 'A'],
            ['24h', '24-h', '24']
        ],
        match: 'text',
        prompt: {
            start: 'Please provide a timezone.\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
            retry: 'Please provide a valid timezone. Try again!\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
            optional: false
        }
    };

    return { format };
}

    async exec(msg, args) {
        let newFormat;
        
        if (args.format == '12h') {
            newFormat = 'dddd, MMMM Do YYYY, hh:mm:ss a';
        }
        else if (args.format == '24h') {
            newFormat = 'dddd, MMMM Do YYYY, HH:mm:ss';
        }

        DB.query(`UPDATE UserTime SET Format = ? WHERE User = ?`, [newFormat, msg.author.id])
        msg.channel.send(`New format: ${newFormat}`);
    }
}