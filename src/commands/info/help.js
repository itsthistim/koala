const { Command } = require('discord-akairo');

module.exports = class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'halp'],
			category: 'Info',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'Which command do you need help with?',
						retry: 'Please provide a valid command.',
						optional: true
					}
				}
			],
			description: {
				content: 'Displays a list of commands or information about a command.',
				usage: '[command]'
			}
		});
	}

	exec(message, { command }) {
		if (!command) return this.execCommandList(message);

		const description = Object.assign({
			content: 'No description available.',
			usage: '',
			examples: [],
			fields: []
		}, command.description);

		const embed = this.client.util.embed()
			.setColor(global.gcolors[0])
			.setTitle(`\`${this.handler.prefix[0]}${command.aliases[0]} ${description.usage}\``)
			.addField('Description', description.content);

		for (const field of description.fields) embed.addField(field.name, field.value);

		if (description.examples.length) {
			const text = `${this.handler.prefix[0]}${command.aliases[0]}`;
			embed.addField('Examples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
		}

		if (command.aliases.length > 1) {
			embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		}

		return message.util.send({ embed });
	}

	async execCommandList(message) {
		const embed = this.client.util.embed()
			.setColor(global.gcolors[0])
			.addField('Command List',
				[
					'This is a list of commands.',
					`To view details for a command, do \`${this.handler.prefix[0]}help <command>\`.`
				]);

		var categories = this.handler.categories.values();

		for (const category of categories) {
			const title = category.id;
			if (title == 'default') {
				continue;
			}
			else if (title) {
				embed.addField(category.id, `\`${category.map(cmd => cmd.aliases[0]).join('` `')}\``/*, true*/);
			}
		}

		await message.util.send({ embed });

		// IN DM

		// const shouldReply = message.guild && message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES');
		// try {
		// 	await message.util.send({ embed });
		// 	if (shouldReply) return message.util.send('I\'ve sent you a DM with the commands. 🙃');
		// } catch (err) {
		// 	return message.util.send('I could not send you the command list in DMs..');
		// }

		return undefined;
	}
}

function hasPermission(message, Command) {
	var client = true, command = true;
	var result = true;
	if (Command.ownerOnly) {
		return message.author.id == '319183644331606016';
	} else
		if (message.guild) {
			if (Command.clientPermissions) {
				if (typeof Command.clientPermissions !== "function") {
					client = message.guild.me.hasPermission(Command.clientPermissions);
				} else {
					client = Command.clientPermissions(message);
				}
			}
			if (Command.userPermissions) {
				if (typeof Command.userPermissions !== "function") {
					command = message.member.hasPermission(Command.userPermissions);
				} else {
					command = Command.userPermissions(message);
				}
			}
		} else {
			result = Command.channelRestriction !== 'guild';
		}
	return result && client && command;
}