import { colors } from '#lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { EmbedBuilder, time, TimestampStyles, userMention } from 'discord.js';

export interface Reminder {
	authorId: string;
	content: string;
	timestamp: number;
	guildId?: string | null;
	channelId: string;
	messageId: string;
	createdAt: number;
}

@ApplyOptions<ScheduledTask.Options>({
	name: 'reminder'
})
export class ReminderTask extends ScheduledTask {
	public async run(reminder: Reminder) {
		try {
			const user = await container.client.users.fetch(reminder.authorId).catch(() => null);
			if (!user) return;

			const relativeTime = time(Math.floor(reminder.createdAt / 1000), TimestampStyles.RelativeTime);
			const jumpLink = `https://discord.com/channels/${reminder.guildId ?? '@me'}/${reminder.channelId}/${reminder.messageId}`;

			const content = `${relativeTime} ${jumpLink}`;
			const embed = new EmbedBuilder() //
				.setColor(colors.default)
				.setTitle('Reminder')
				.setDescription(reminder.content);

			await user.send({ content, embeds: [embed] }).catch(() => {
				// attempt to send in the original context if DMs are closed
				const channel = container.client.channels.cache.get(reminder.channelId);
				const originMessage = channel?.isTextBased() ? channel.messages.cache.get(reminder.messageId) : null;

				if (channel?.isSendable?.()) {
					channel.send({ content: `${userMention(user.id)}\n${content}`, embeds: [embed] }).catch((error) => {
						this.container.logger.warn(error);
					});
				} else if (originMessage) {
					originMessage?.reply({ content: `${userMention(user.id)}\n${content}`, embeds: [embed] }).catch((error) => {
						this.container.logger.warn(
							`[ReminderTask] Could not reply to original message ${reminder.messageId} in channel ${reminder.channelId} for user ${reminder.authorId}:`,
							error
						);
					});
				} else {
					this.container.logger.warn(
						`[ReminderTask] Could not send reminder to user ${reminder.authorId} in channel ${reminder.channelId}`
					);
				}
			});
		} catch (error) {
			this.container.logger.error('[ReminderTask] Error running reminder task:', error);
		}
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		reminder: Reminder;
	}
}
