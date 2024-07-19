import { Command } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import moment from 'moment';
import table from 'table';
import PasteGG from 'paste.gg';
import { Time } from '@sapphire/time-utilities';

export class UserCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'serverinvite',
			aliases: ['serverinvite'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: ['ownerOnly'],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Invites the user to the server.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	async messageRun(message, args) {
		let input = await args.rest('string').catch(() => null);
		if (!input) return reply(message, 'Please provide a guild ID.');

		let guild = this.container.client.guilds.cache.get(input);
		if (!guild) return reply(message, 'Could not find this guild.');

		let inviteChannel = guild.channels.cache.filter((c) => c.type === 0).first();
		let botOwner = this.container.client.users.cache.get('319183644331606016');

		// return botOwner.send(await this.getPaste(list, 'guilds'));

		console.log(inviteChannel);

		guild.invites.create(inviteChannel).then((invite) => {
			botOwner.send(invite.url);
		});
	}
}
