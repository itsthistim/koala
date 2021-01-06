const { Listener } = require('discord-akairo');
const Logger = require('../util/logger.js');;

module.exports = class CooldownListener extends Listener {
	constructor() {
		super('cooldown', {
			event: 'cooldown',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	async exec(message, command, remaining) {
		const time = remaining / 1000;
		const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
		Logger.log(`=> ${command.id} ~ ${time}`, { tag });

		if (message.guild ? message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES') : true) {
			let msg = await message.reply(`you can use that command again in ${time} seconds.`);
			msg.delete({timeout: remaining});
		}
	}
}