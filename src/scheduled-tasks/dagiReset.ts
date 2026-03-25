import { db } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 14 * * 5', // every friday at 2:00 PM
	name: 'dagiReset'
})
export class DagiResetTask extends ScheduledTask {
	public async run() {
		try {
			// current count
			const result = await db.query(`SELECT count FROM "dagi_count" WHERE id = 1;`);
			const count = result.rows.length > 0 ? result.rows[0].count : 0;

			// send to channel
			const channelId = '1486373056707297412';
			const channel = await container.client.channels.fetch(channelId).catch(() => null);

			if (channel?.isTextBased() && channel.isSendable()) {
				await channel.send(`Dagi Counter reset!\n This weeks count: **${count}**`);
			} else {
				this.container.logger.error(`[DagiResetTask] Could not find or send to channel ${channelId}`);
			}

			// reset count
			await db.query(`
				INSERT INTO "dagi_count" (id, count)
				VALUES (1, 0)
				ON CONFLICT (id)
				DO UPDATE SET count = 0;
			`);
		} catch (error) {
			this.container.logger.error('[DagiResetTask] Error running dagi reset task:', error);
		}
	}
}
