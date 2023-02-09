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
				builder.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev').setDescription(this.description);
			},
			{
				guildIds: [],
				idHints: '1072971983538618501'
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
