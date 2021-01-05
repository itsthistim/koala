const { Listener } = require('discord-akairo');
const Logger = require('../util/logger.js');;

class CommandStartedListener extends Listener {
	constructor() {
		super('commandStarted', {
			event: 'commandStarted',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command) {
		const tag = message.guild ? `${message.author.tag} in ${message.guild.name}` : `${message.author.tag}/PM`;
		Logger.log(`=> ${command.id}`, { tag });
	}
}

module.exports = CommandStartedListener;