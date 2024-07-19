import { Command } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';

import { updateIdHints } from '#lib/util';

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
