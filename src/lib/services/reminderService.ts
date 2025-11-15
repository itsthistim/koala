import { container } from '@sapphire/framework';
import { EmbedBuilder, time, TimestampStyles, userMention } from 'discord.js';
import { getReminderDatabase, Reminder } from '#lib/database/reminders';

export class ReminderService {
	private interval: NodeJS.Timeout | null = null;
	private isChecking = false;
	private readonly CHECK_INTERVAL = 60_000; // Check every minute

	public start() {
		if (this.interval) return;

		// check reminders on start
		this.checkReminders();

		// check every minute
		this.interval = setInterval(() => this.checkReminders(), this.CHECK_INTERVAL);
	}

	public stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	private async checkReminders() {
		// prevent overlapping executions
		if (this.isChecking) {
			container.logger.debug('[ReminderService] Skipping check - previous check still in progress');
			return;
		}

		this.isChecking = true;

		try {
			const db = getReminderDatabase();
			const dueReminders = db.getDueReminders();

			if (dueReminders.length === 0) return;

			container.logger.debug(`[ReminderService] Processing ${dueReminders.length} due reminder(s)`);

			for (const reminder of dueReminders) {
				await this.sendReminder(reminder);
				db.markCompleted(reminder.id);
			}
		} catch (error) {
			container.logger.error('[ReminderService] Error checking reminders:', error);
		} finally {
			this.isChecking = false;
		}
	}

	private async sendReminder(reminder: Reminder) {
		try {
			const user = await container.client.users.fetch(reminder.userId).catch(() => null);
			if (!user) {
				container.logger.warn(`[ReminderService] User ${reminder.userId} not found for reminder ${reminder.id}`);
				return;
			}

			let messageLink = '';
			if (reminder.channelId && reminder.messageId) {
				messageLink = `https://discord.com/channels/${reminder.guildId || '@me'}/${reminder.channelId}/${reminder.messageId}`;
			}

			const embed = new EmbedBuilder()
				.setColor(0x5865f2)
				.setTitle('⏰ Reminder')
				.setDescription(reminder.message)
				.addFields({
					name: 'Set',
					value: time(Math.floor(reminder.createdAt / 1000), TimestampStyles.RelativeTime),
					inline: true
				})
				.setTimestamp();

			const content = messageLink ? `${userMention(reminder.userId)}\n${messageLink}` : userMention(reminder.userId);

			await user.send({ content, embeds: [embed] }).catch((error) => {
				container.logger.warn(`[ReminderService] Failed to DM user ${reminder.userId}:`, error.message);
			});
		} catch (error) {
			container.logger.error(`[ReminderService] Error sending reminder ${reminder.id}:`, error);
		}
	}
}

let reminderService: ReminderService | null = null;

export function getReminderService(): ReminderService {
	if (!reminderService) {
		reminderService = new ReminderService();
	}
	return reminderService;
}
