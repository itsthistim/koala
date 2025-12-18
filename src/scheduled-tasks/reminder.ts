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
	public?: boolean;
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
			const jumpLink = `<https://discord.com/channels/${reminder.guildId ?? '@me'}/${reminder.channelId}/${reminder.messageId}>`;

			const embed = new EmbedBuilder() //
				.setColor(colors.default)
				.setTitle('Reminder')
				.setDescription(`${reminder.content}\n\n[Jump to message](${jumpLink})\n-# Reminder set ${relativeTime}`);

			if (reminder.public) {
				const srcChannel = await container.client.channels.fetch(reminder.channelId).catch(() => null);
				const srcMessage = srcChannel?.isTextBased() ? await srcChannel.messages.fetch(reminder.messageId).catch(() => null) : null;

				if (srcMessage) {
					return await srcMessage.reply({
						// reply to original message
						content: `${userMention(reminder.authorId)}, ${reminder.content}`,
						allowedMentions: { users: [reminder.authorId] }
					});
				} else if (srcChannel?.isSendable()) {
					// if no message to reply to, just send in channel (happens with slash commands)
					return await srcChannel.send({
						content: `${userMention(reminder.authorId)}, ${reminder.content}`,
						allowedMentions: { users: [reminder.authorId] }
					});
				} else {
					// could not send, fallback to DM
					return await user.send({ embeds: [embed] });
				}
			} else {
				return await user.send({ embeds: [embed] });
			}
		} catch (error) {
			return this.container.logger.error('[ReminderTask] Error running reminder task:', error);
		}
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		reminder: Reminder;
	}
}
