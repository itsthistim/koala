import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

export interface UnbanPayload {
	guildId: string;
	userId: string;
}

@ApplyOptions<ScheduledTask.Options>({
	name: 'unban'
})
export class UnbanTask extends ScheduledTask {
	public async run(payload: UnbanPayload) {
		try {
			const guild = await container.client.guilds.fetch(payload.guildId).catch(() => null);
			if (!guild) return;

			await guild.bans.remove(payload.userId, 'Temporary ban expired').catch(() => null);
		} catch (error) {
			this.container.logger.error('[UnbanTask]', error);
		}
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		unban: UnbanPayload;
	}
}
