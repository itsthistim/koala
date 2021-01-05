const { Command, Flag } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class TimeCommand extends Command {
    constructor() {
        super('time', {
            aliases: ['time'],
            category: 'Time',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 5000,
            ratelimit: 1,
            ignoreCooldown: [],
            description: {
                content: '`set` Set your timezone.\n`get` Get a users time.\n`clear` Remove your time from the database.\n`config-set` Set the time of a user.\n`config-clear` Remove a user time from the database.',
                usage: ''
            },
        })
    }

    *args() {
        const action = yield {
            type: [
				['time-get', 'get', 'g'],
				['time-set', 'set', 's'],
				['time-format', 'format', 'f'],
				['time-clear', 'clear', 'c'],
				['time-config-set', 'config-set', 'configset', 'c-set', 'cset', 'cs'],
				['time-config-clear', 'config-clear', 'configclear', 'c-clear', 'clear', 'cc']
			],
            match: 'phrase',
            prompt: {
                start: 'What action would you like to perform?\n\n`set` Set your timezone.\n`get` Get a users time.\n`clear` Remove your time from the database.\n`config-set` Set the time of a user.\n`config-clear` Remove a user time from the database.',
                retry: 'Please provide a valid action. Try again!',
                optional: false
            }
        };
        
        return Flag.continue(action);
    }
}