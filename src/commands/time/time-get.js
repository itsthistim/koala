// t!get <user|time> => time formatted to timezone set in t!set <timezone>

const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment-timezone');
const mysql = require("mysql2/promise");

module.exports = class GetCommand extends Command {
    constructor() {
        super('time-get', {
            userPermissions: [],
            clientPermissions: ["MANAGE_ROLES"],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            description: {
                content: 'No description provided.',
                usage: '<member>'
            },
        })
    }

*args() {
    // const timezone = yield {
    //     type: Argument.validate('string', (msg, phrase, str) => moment.tz.names().find(key => key.toUpperCase() === str.toUpperCase()) != undefined),
    //     match: 'text',
    //     prompt: {
    //         start: 'Please provide a timezone.\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
    //         retry: 'Please provide a valid timezone. Try again!\nFor a list of valid timezones [click here](https://gist.github.com/Xavons/d8a416cd45b9e18e82d3b1682fcd92b1).',
    //         optional: false
    //     }
    // };
    
    // const timeUser = yield {
    //     type: 'user',
    //     match: 'phrase',
    //     prompt: {
    //         start: 'Please provide a user.',
    //         retry: 'Please provide a valid user. Try again!',
    //         optional: false
    //     }
    // };

    const timeUser = yield {
        type: (message, str) => {

            if (!str) {
                return null;
            }
            else if (moment.tz.names().find(key => key.toUpperCase() === str.toUpperCase()) != undefined) {
                return str;
            }
            else if (this.client.util.resolveUser(str, this.client.users.cache) != undefined) {
                return this.client.util.resolveUser(str, this.client.users.cache);
            }
            else {
                return null;
            }
        },
        match: 'phrase',
        prompt: {
            start: 'Please provide a user or timezone.',
            retry: 'Please provide a valid user or timezone. Try again!',
            optional: false
        }
    };

    return { timeUser };
}

    async exec(msg, args) {
        msg.delete({timeout: 5000});

        const [ userTime ] = await DB.query(`SELECT TimeZone FROM UserTime WHERE User = ?`, [ args.timeUser.id ]);
        const [ userFormat ] = await DB.query(`SELECT Format FROM UserTime WHERE User = ?`, [ msg.author.id ]);
        let embed = this.client.util.embed();

        if (args.timeUser.id == undefined) {
            msg.channel.send(moment().tz(args.timeUser).format(userFormat[0].Format));
            
            embed.setColor(global.gcolors[0]);
            embed.setAuthor(`${args.timeUser.username}'s time`, args.timeUser.avatarURL( {dynamic: true} ));
            embed.setDescription(moment().tz(userTime[0].TimeZone).format('hh:mm:ss a'));
        }
        else {
            if (userTime.length > 0) {
                embed.setColor(global.gcolors[0]);
                embed.setAuthor(`${args.timeUser.username}'s time`, args.timeUser.avatarURL( {dynamic: true} ));
                embed.setDescription(moment().tz(userTime[0].TimeZone).format(userFormat[0].Format));
            }
            else {
                embed.setDescription(`This user didn't set a timezone yet.`)
            }
            
            msg.util.send(embed);
        }
    }
}