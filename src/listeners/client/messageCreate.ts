import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Events, type Message } from 'discord.js';
import { blackjackHelper, trainingHelper } from '#lib/utils/epicrpgHelper';

@ApplyOptions<Listener.Options>(({ container }) => ({
	description: 'Handle Message Create event',
	emitter: container.client,
	event: Events.MessageCreate
}))
export class ClientListener extends Listener {
	public async run(msg: Message) {
		await blackjackHelper(msg);
		await trainingHelper(msg);
	}
}
