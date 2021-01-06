const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { get } = require("snekfetch");

module.exports = class DadJokeCommand extends Command {
    constructor() {
        super('dad-joke', {
            aliases: ['dad-joke'],
            category: 'Random',
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

    async exec(msg) {
        msg.delete({ timeout: 5000 });
        const { body } = await get("https://icanhazdadjoke.com/").set("Accept", "application/json").catch(e => {
            Error.captureStackTrace(e);
            return e;
        });
        const desc = body.joke && body.joke.length < 1900 ? body.joke : `${body.joke.substring(0, 1900)}...`;
        
        const embed = this.client.util.embed()
            .setAuthor("Dad says:","https://alekeagle.com/assets/images/dad.png")
            .setDescription(`${desc}`)
            .setColor("RANDOM");
        return msg.util.send(embed);
    }
}