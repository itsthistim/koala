import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import { cutTo, softWrap, capitalize, sendLoadingMessage, pickRandom } from '#lib/functions';
import { reply } from '@sapphire/plugin-editable-commands';

export class TestCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'test',
			description: 'Testing.',
			preconditions: ['ownerOnly']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'], // guilds for the command to be registered in; global if empty
				idHints: '1063617609263755324' // commandId, define after registering (id will be in log after first run)
			}
		);
	}

	async chatInputRun(interaction) {
		interaction.reply({ content: 'test' });
	}

	async messageRun(message) {
		message.channel.send('test');
	}
}
