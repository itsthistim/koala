const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class PurgeCommand extends Command {
    constructor() {
        super('purge', {
            aliases: ['purge'],
            userPermissions: ['MANAGE_MESSAGES'],
            clientPermissions: ['MANAGE_MESSAGES'],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    *args() {
        const amount = yield {
            type: 'integer',
            match: 'phrase',
            prompt: {
                start: 'How many messages should I delete?',
                retry: 'Please provide a valid number. Try again!',
                optional: false
            }
        };
        
        return { amount };
    }

    async exec(message, args) {
        
        let leftToDelete;
        let deletable = 0;
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        (async (delay) => {
            let del = true;
            while (del) {
                await wait(delay);
                deletable = parseInt(deletable + 100); // amount of msgs it can delete
                leftToDelete = parseInt((args.amount - deletable) + 100 ); // subtract the msgs it can delete from input and add 100 to delete correct amount

                if (leftToDelete > 100) {
                    const fetch = await message.channel.messages.fetch(filter, { limit: 100 })
                    let filter = fetchedMessages.filter(msg => msg.createdTimestamp < 1209600000 )
                    let deletedAmount = await message.channel.bulkDelete(fetch);
                    message.channel.send(`Deleted ${deletedAmount} messages.`);
                } else {
                    const fetch = await message.channel.messages.fetch({
                        limit: leftToDelete
                    })
                    let deletedAmount = await message.channel.bulkDelete(fetch)
                    message.channel.send(`Deleted ${deletedAmount.size} messages.`);
                    del = false;
                }
            }
        })(2000)
    }
}