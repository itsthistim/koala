// t!set <timezone> => save timezone of user in db: user,timezone

const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment-timezone');

module.exports = class SetTimeCommand extends Command {
    constructor() {
        super('time-set', {
            aliases: ['set'],
            category: 'Time',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            description: {
                content: 'Sets your timezone.\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1)',
                usage: '<timezone>'
            },
        })
    }

*args() {
    const timezone = yield {
        type: Argument.validate('string', (msg, phrase, str) => moment.tz.names().find(key => key.toUpperCase() === str.toUpperCase()) != undefined),
        match: 'text',
        prompt: {
            start: 'Please provide a timezone.\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
            retry: 'Please provide a valid timezone. Try again!\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
            optional: false
        }
    };
    
    return { timezone };
}

    async exec(msg, args) {

        const [ user ] = await DB.query(`SELECT User FROM UserTime WHERE User = ?`, [ msg.author.id ]);

        if (user.length == 0) {
            DB.query(`INSERT INTO UserTime (User, TimeZone) VALUES (?,?)`, [msg.author.id, args.timezone.toLowerCase()])
            msg.channel.send("inserted")
        }
        else {
            DB.query(`UPDATE UserTime SET TimeZone = ? WHERE User = ?`, [args.timezone.toLowerCase(), msg.author.id])
            msg.channel.send("updated")
        }

    }
}