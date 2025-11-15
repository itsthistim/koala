import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type Client } from 'discord.js';

@ApplyOptions<Listener.Options>(({ container }) => ({
	description: 'Handle Raw Message Delete events',
	emitter: container.client.ws,
	event: GatewayDispatchEvents.Ready
}))
export class ClientListener extends Listener {
	public run(client: Client) {
		const { username, id } = client.user!;
		this.container.logger.info(`Successfully logged in as ${username} (${id})`);
	}
}
