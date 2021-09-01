const { Command, Argument } = require('discord-akairo');
var moment = require('moment')
var parse = require('parse-duration')

module.exports = class UnixCommand extends Command {
    constructor() {
        super('unix', {
            aliases: ['unix'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            description: {
                content: 'Sends an unix timestamp.',
                usage: '[duration]'
            },
        })
    }

    *args() {
        const time = yield {
            type: Argument.validate('string', (m, p, str) => parse(str, 's') != null),
            match: 'rest',
            prompt: {
                start: 'When?',
                retry: 'Please provide a valid time!\n\n**Usage:**\n\`k!unix 1h\`\n\`k!unix 2d4h\`',
                optional: false
            }
        };
        
        return { time };
    }

    async exec(msg, { time }) {
        let duration = parse(time, 's');

        if(duration != null) {
            let now = moment().unix();
            let then = now + duration;
            
            let e = this.client.util.embed()
            .setTitle(then)
            .setDescription(`<t:${then}:F>\n<t:${then}:R>`);

            msg.channel.send(e);
        }
    }
}