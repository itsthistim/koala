import { colors } from '#lib/constants';
import { getReminderDatabase, Reminder } from '#lib/database/reminders';
import { Time } from '@sapphire/time-utilities';
import { container } from '@sapphire/framework';
import { EmbedBuilder, time, TimestampStyles, userMention } from 'discord.js';

export class ReminderService {
	private interval: NodeJS.Timeout | null = null;
	private isChecking = false;
	private readonly CHECK_INTERVAL = 1 * Time.Minute; // Check every minute

	public start() {
		if (this.interval) return;
		this.checkReminders();
		this.interval = setInterval(() => this.checkReminders(), this.CHECK_INTERVAL);
	}

	public stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	private async checkReminders() {
		if (this.isChecking) {
			return container.logger.debug('[ReminderService] Skipping check - previous check still in progress');
		}

		this.isChecking = true;

		try {
			const db = getReminderDatabase();
			const dueReminders = db.getDueReminders();

			if (dueReminders.length === 0) return; // no due reminders

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
			const user = await container.client.users.fetch(reminder.user_id).catch(() => null);
			if (!user) {
				return container.logger.warn(`[ReminderService] User ${reminder.user_id} not found for reminder ${reminder.id}!`);
			}

			let messageLink = '';
			if (reminder.channel_id && reminder.message_id) {
				messageLink = `https://discord.com/channels/${reminder.guild_id || '@me'}/${reminder.channel_id}/${reminder.message_id}`;
			}

			const embed = new EmbedBuilder()
				.setColor(colors.default)
				.setTitle('Reminder')
				.setDescription(reminder.reminderText)
				.addFields({
					name: 'Set',
					value: time(Math.floor(reminder.createdAt / 1000), TimestampStyles.RelativeTime),
					inline: true
				})
				.setTimestamp();

			const content = messageLink ? `${userMention(reminder.user_id)}\n${messageLink}` : userMention(reminder.user_id);

			await user.send({ content, embeds: [embed] }).catch((error) => {
				container.logger.warn(`[ReminderService] Failed to DM user ${reminder.user_id}:`, error.message);
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
