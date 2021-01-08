const { Command } = require('discord-akairo');

class InviteCommand extends Command {
	constructor() {
		super('invite', {
			aliases: ['invite'],
			category: 'Lookup',
			clientPermissions: ['EMBED_LINKS'],
			description: { content: 'Invite me to your server.' }
		});
	}

	async fetchInvite() {
		if (this.invite) return this.invite;
		const invite = await this.client.generateInvite([
			'ADMINISTRATOR',
			'VIEW_CHANNEL',
			'SEND_MESSAGES',
			'READ_MESSAGE_HISTORY',
			'MANAGE_MESSAGES',
			'EMBED_LINKS',
			'ATTACH_FILES',
			'ADD_REACTIONS',
			'CREATE_INSTANT_INVITE',
			'VIEW_AUDIT_LOG',
			'SEND_TTS_MESSAGES',
			'MANAGE_WEBHOOKS'
		]);

		this.invite = invite;
		return invite;
	}

	async exec(message) {
		const embed = this.client.util.embed()
			.setColor(global.gcolors[0])
			.setDescription(`**[Add me to your server!](${await this.fetchInvite()})**`);

		return message.util.send({ embed });
	}
}

module.exports = InviteCommand;