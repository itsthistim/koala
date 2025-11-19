import { colors } from '#lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { EmbedBuilder, Message, time, TimestampStyles, User, userMention } from 'discord.js';

export interface Reminder {
	author: User;
	content: string;
	timestamp: number;
	ctx: Message | Command.ChatInputCommandInteraction;
}

@ApplyOptions<ScheduledTask.Options>({
	name: 'reminder'
})
export class ReminderTask extends ScheduledTask {
	public async run(reminder: Reminder) {
		try {
			const user = await container.client.users.fetch(reminder.author.id).catch(() => null);
			if (!user) return this.container.logger.warn(`[ReminderTask] User ${reminder.author.id} not found`);

			const relativeTime = time(Math.floor(reminder.timestamp / 1000), TimestampStyles.RelativeTime);
			const jumpLink = `https://discord.com/channels/${reminder.ctx.guildId ?? '@me'}/${reminder.ctx.channelId}/${'id' in reminder.ctx ? reminder.ctx.id : ''}`;

			const content = `${jumpLink}`;
			const embed = new EmbedBuilder() //
				.setColor(colors.default)
				.setTitle('Reminder')
				.setDescription(`${reminder.content}\n\n${relativeTime}`);

			await user.send({ content, embeds: [embed] }).catch(() => {
				// attempt to send in the original context if DMs are closed
				if (reminder.ctx instanceof Message) {
					if (reminder.ctx.channel?.isSendable?.()) {
						reminder.ctx.channel.send({ content: `${userMention(user.id)}\n${content}`, embeds: [embed] }).catch((err) => {
							this.container.logger.error(`[ReminderTask] Failed to send reminder for user ${user.id}: ${err.message}`);
						});
					}
				} else {
					reminder.ctx.reply({ content, embeds: [embed], ephemeral: true }).catch((err) => {
						this.container.logger.error(`[ReminderTask] Failed to send reminder for user ${user.id}: ${err.message}`);
					});
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
