import { Command } from '@sapphire/framework';
import { stripIndents } from 'common-tags';
import { cutTo, softWrap, capitalize, sendLoadingMessage, pickRandom } from '#lib/functions';
import { reply } from '@sapphire/plugin-editable-commands';

import { updateIdHints } from '#lib/functions';

export class IdHintsCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'idhints',
			description: 'Testing.',
			preconditions: ['ownerOnly']
		});
	}

	async messageRun(message) {
		// updateIdHints();
		reply(message, 'Deprecated!');
	}
}
