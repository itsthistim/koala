import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Events, type Client } from 'discord.js';

@ApplyOptions<Listener.Options>(({ container }) => ({
	description: 'Handle Client Ready event',
	emitter: container.client,
	event: Events.ClientReady
}))
export class ClientListener extends Listener {
	public run(client: Client) {
		const { username, id } = client.user!;
		this.container.logger.info(`Successfully logged in as ${username} (${id})`);
	}
}
