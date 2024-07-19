import { Command } from '@sapphire/framework';
import { reply } from '@skyra/editable-commands';
import parse from 'parse-duration';
import humanizeDuration from 'humanize-duration';

export class TestCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'test',
			description: 'Testing stuff.',
			preconditions: ['ownerOnly']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['502208815937224715']
			}
		);
	}

	async chatInputRun(interaction) {
		interaction.reply({ content: 'test' });
	}

	async messageRun(message, args) {
		var time = await args.rest('string').catch(() => null);

		if (!time) {
			return reply(message, 'You must specify a time.');
		}

		var duration = parse(time, 'ms');

		// if (!duration) {
		// 	return reply(message, 'You must specify a valid time.');
		// }

		// if (duration < 0) {
		// 	return reply(message, 'You must specify a time greater than 1 second.');
		// }

		reply(message, `${time} = ${duration}ms\n\nWhich is ${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'], conjunction: ' and ', serialComma: false })}`);

		// reply(message, `${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'], conjunction: ' and ', serialComma: false })}`);
	}
}
