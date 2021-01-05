const { Command } = require('discord-akairo');

module.exports = class PrefixCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            category: 'Info',
            typing: true
        });
    }

    async exec(message) {
        message.channel.send(`The current prefix is: **\`${global.gprefixes[0]}\`**`);
    }
}