const { Listener } = require('discord-akairo');

module.exports = class UserUpdateListener extends Listener {
	constructor() {
		super('userUpdate', {
			emitter: 'client',
			event: 'userUpdate'
		});
	}

	async exec(oldUser, newUser) {
		if (newUser.id == '319183644331606016' || newUser.id == '533683446925754368' || newUser.id == '310484600247943169') {
			let channel = this.client.channels.cache.get('710023601931157536');

			let embed = this.client.util.embed();
			embed.setColor(global.gcolors[0]);
			embed.setTitle(`User update!`);
			embed.setDescription(newUser);

			if (newUser.username != oldUser.username) {
				embed.addField(`Username`, `Old: ${oldUser.username}\nNew: ${newUser.username}`);
			}

			if (newUser.discriminator != oldUser.discriminator) {
				embed.addField(`Discriminator`, `Old: ${oldUser.discriminator}\nNew: ${newUser.discriminator}`);
			}

			if (newUser.avatarURL() != oldUser.avatarURL()) {
				embed.addField(`Discriminator`, `Old: \`${oldUser.avatarURL()}\`\nNew: \`${newUser.avatarURL()}\``);
			}
		}
	}
}