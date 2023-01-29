import { Command } from '@sapphire/framework';
import moment from 'moment';
import table from 'table';
import PasteGG from 'paste.gg';
import { Time } from '@sapphire/time-utilities';

export class ServerListCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'serverlist',
			aliases: ['slist'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: ['ownerOnly'],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Lists servers the bot is in.',
			detailedDescription: '',
			usage: '',
			examples: ['']
		});
	}

	// registerApplicationCommands(registry) {
	// 	registry.registerChatInputCommand(
	// 		(builder) => {
	// 			builder.setName(this.name).setDescription(this.description);
	// 		},
	// 		{
	// 			guildIds: ['502208815937224715', '628122911449808896'], // guilds for the command to be registered in; global if empty
	// 			idHints: '1058004861502890014' // commandId, define after registering (id will be in log after first run)
	// 		}
	// 	);
	// }

	// async chatInputRun(interaction) {
	// 	let msg = this.getList();
	// 	interaction.reply({
	// 		content: `Check DMs.`,
	// 		ephemeral: true
	// 	});
	// }

	async messageRun(message, args) {
		this.getList();
	}

	async getList() {
		let botOwner = this.container.client.users.cache.get('319183644331606016');

		// create table
		const data = [['Name', 'ID', 'Owner', 'Members', 'Bots', 'Total', 'Created', 'Joined']];

		// for each guild sorted by total membercount add the values to the corresponding row
		this.container.client.guilds.cache
			.sort((a, b) => b.memberCount - a.memberCount)
			.forEach((guild) => {
				data.push([
					guild.name,
					guild.id,
					this.container.client.users.cache.get(guild.ownerId).tag,
					guild.members.cache.filter((m) => !m.user.bot).size,
					guild.members.cache.filter((m) => m.user.bot).size,
					guild.memberCount,
					moment(guild.createdTimestamp).format('MMMM Do YYYY, h:mm:ss a') + ` (${moment(guild.createdTimestamp).fromNow()})`,
					moment(guild.joinedTimestamp).format('MMMM Do YYYY, h:mm:ss a') + ` (${moment(guild.joinedTimestamp).fromNow()})`
				]);
			});

		let config = {
			border: table.getBorderCharacters('ramac')
		};

		let list = table.table(data, config);
		return botOwner.send(await this.getPaste(list, 'guilds'));
	}

	async getPaste(content, title) {
		try {
			const client = new PasteGG();
			let paste = await client.post({
				name: title,
				expires: new Date(Date.now() + Time.Minute * 2),
				description: title,
				files: [
					{
						name: `${title}.txt`,
						content: {
							format: 'text',
							highlight_language: null,
							value: content
						}
					}
				]
			});

			return `\nhttps://paste.gg/p/anonymous/${paste?.result?.id}/revisions`;
		} catch (err) {
			return `\n${err}`;
		}
	}
}
