const { Command, Flag } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class PrefixCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            category: 'Info',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 5000,
            ratelimit: 1,
            ownerOnly: true,
            ignoreCooldown: [],
            description: {
                content: '',
                usage: ''
            },
        })
    }

    *args() {
        const action = yield {
            type: [
				['prefix-add', 'add', 'a'],
				['prefix-remove', 'remove', 'r', 'delete', 'del', 'd'],
				['prefix-list', 'list', 'l']
			],
            match: 'phrase',
            prompt: {
                start: 'What action would you like to perform?\n\n`set` Set your timezone.\n`get` Get a users time.\n`clear` Remove your time from the database.\n`config-set` Set the time of a user.\n`config-clear` Remove a user time from the database.',
                retry: 'Please provide a valid action. Try again!',
                optional: true
            },
            default: 'prefix-list'
        };
        
        return Flag.continue(action);
    }
}