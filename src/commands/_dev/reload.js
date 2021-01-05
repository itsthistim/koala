const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			ownerOnly: true,
			args: [
				{
					id: 'commandID'
				}
			],
			description: {
				content: 'Reloads a module.',
				usage: '<module> [type:]'
			}
		});
	}

	exec(message, args) {
		// this.handler.reload(args.commandID);
		// return message.reply(`Reloaded command ${args.commandID}!`);

		try {
			this.handler.reload(args.commandID);
			return message.reply(`Reloaded command ${args.commandID}!`);
		}
		catch (err) {
			Logger.error(`Error occured reloading ${args.commandID}`);
			Logger.stacktrace(err);
			return message.util.reply(`Failed to reload \`${args.commandID}\`.`);
		}
	}
}

module.exports = ReloadCommand;