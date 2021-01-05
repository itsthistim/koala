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
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    *args() {
        const discrim = yield {
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
        
        const embed = this.client.util.embed()
            .setTitle(`${users.length} Users with the discriminator: ${discrim}`)
            .setDescription(users.join(', '));
        message.channel.send(embed);
    }
}