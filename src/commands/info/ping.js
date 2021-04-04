const { Command } = require('discord-akairo');

module.exports = class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
            category: 'Info',
            typing: true
        });
    }

    async exec(message) {
        const msg = await message.util.send('Pinging~');
		const latency = (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp);
		return message.util.send([
			`**Gateway Ping~ ${latency.toString()}ms**`,
            `**API Ping~ ${Math.round(this.client.ws.ping).toString()}ms**`
        ]);
    }
}