import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Events, type Message } from 'discord.js';
import { blackjackHelper, trainingHelper } from '#lib/utils/epicrpgHelper';

@ApplyOptions<Listener.Options>(({ container }) => ({
	description: 'Handle Message Update event',
	emitter: container.client,
	event: Events.MessageUpdate
}))
export class ClientListener extends Listener {
	public async run(_oldMsg: Message, newMsg: Message) {
		await blackjackHelper(newMsg);
		await trainingHelper(newMsg);
	}
}
