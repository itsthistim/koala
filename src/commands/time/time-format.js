const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment-timezone');
const mysql = require("mysql2/promise");

module.exports = class FormatCommand extends Command {
    constructor() {
        super('time-format', {
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,    
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
            newFormat = 'hh:mm a, Do MMM YYYY';
        }
        else if (args.format == '24h') {
            newFormat = 'HH:mm, Do MMM YYYY';
        }

        DB.query(`UPDATE UserTime SET Format = ? WHERE User = ?`, [newFormat, msg.author.id])
        
        let e = this.client.util.embed()
        .setColor(global.gcolors[1])
        .setAuthor(`Updated format!`, this.client.user.avatarURL())
        .setDescription(`${this.client.user.username} will now use the ${args.format} format for the time commands!`);
        
        msg.util.send(e);
    }
}