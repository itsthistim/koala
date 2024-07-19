import { Command } from '@sapphire/framework';
import { reply } from '@skyra/editable-commands';
// import parse from 'parse-duration';
// import humanizeDuration from 'humanize-duration';

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
		reply(message, 'test');
	}
}
