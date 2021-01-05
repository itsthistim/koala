const { Inhibitor } = require('discord-akairo');

module.exports = class BlacklistInhibitor extends Inhibitor {
    constructor() {
        super('blacklist', {
            reason: 'blacklist',
            type: 'all'
        })
    }

    exec(message) {
        const blockedUsers = ['SOME_USER'];        
        return blockedUsers.includes(message.author);
    }
}

