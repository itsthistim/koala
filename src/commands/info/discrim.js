const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class DiscrimCommand extends Command {
    constructor() {
        super('discrim', {
            aliases: ['discrim', 'discriminator'],
            category: 'Lookup',
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

    *args() {
        const discriminator = yield {
            type: 'string',
            match: 'phrase',
            prompt: {
                start: 'What discriminator do you want to look for?',
                retry: 'Please provide a valid discriminator. Try again!',
                optional: false
            }
        };
        
        return { discriminator };
    }

    async exec(message, { discriminator }) {
        
        let users = this.client.users.cache;
        let matches = [];

        users.forEach(element => {
            if(element.discriminator === discriminator) {
                matches.push(`${element.username}#${element.discriminator}`);
            }
        });

        if (matches.length === 0) {
            message.channel.send("No matches found.");
        } else {
            let reply = "```" + matches.join("\n") + "```";
            reply += " Sample size: " + users.size;

            message.channel.send(reply); // send user list 
        }


        // const embed = this.client.util.embed()
        //     .setTitle(`${users.length} users with the discriminator: ${discriminator}`)
        //     .setDescription(users.join(', '));
        // message.channel.send(embed);
    }
}