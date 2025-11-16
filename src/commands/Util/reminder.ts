import { getReminderDatabase, Reminder } from '#lib/database/reminders';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Duration, Time } from '@sapphire/time-utilities';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplicationIntegrationType, InteractionContextType, time, TimestampStyles, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Subcommand.Options>({
	aliases: ['remindme', 'remind', 'notifyme', 'notify', 'rm'],
	description: 'Set a reminder to be notified later',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	subcommands: [
		{
			name: 'create',
			chatInputRun: 'chatInputCreate',
			messageRun: 'messageCreate',
			default: true
		},
		{
			name: 'remove',
			chatInputRun: 'chatInputRemove',
			messageRun: 'messageRemove'
		},
		{
			name: 'list',
			chatInputRun: 'chatInputList',
			messageRun: 'messageList'
		}
	]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addSubcommand((subcommand) =>
			subcommand //
				.setName('create')
				.setDescription('Create a new reminder')
				.addStringOption((option) =>
					option //
						.setName('time')
						.setDescription('When to remind you (e.g., "30m", "2h", "1d")')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option //
						.setName('message')
						.setDescription('What to remind you about')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand //
				.setName('remove')
				.setDescription('Remove a reminder by its ID')
				.addIntegerOption((option) =>
					option //
						.setName('id')
						.setDescription('The ID of the reminder to remove')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand //
				.setName('list')
				.setDescription('List your active reminders')
		)
)
export class UserCommand extends Subcommand {
	public async chatInputCreate(interaction: Command.ChatInputCommandInteraction) {
		const timeStr = interaction.options.getString('time', true);
		const reminderText = interaction.options.getString('message', true);

		const result = this.createReminder(
			interaction.user.id,
			reminderText,
			timeStr,
			interaction.guildId ?? undefined,
			interaction.channelId,
			interaction.id
		);

		return await interaction.reply({
			content: result.error ?? result.success!,
			ephemeral: true
		});
	}

	public async messageCreate(msg: Message, args: Args) {
		const timeStr = await args.pick('string').catch(() => null);
		const reminderText = await args.rest('string').catch(() => null);

		if (!timeStr && !reminderText) {
			return this.messageList(msg);
		}

		if (!timeStr) {
			return reply(msg, 'Please provide a time (e.g., `30m`, `2h`, `1d`)');
		}

		if (!reminderText) {
			return await reply(msg, 'Please provide a reminder message');
		}

		const result = this.createReminder(msg.author.id, reminderText, timeStr, msg.guildId ?? undefined, msg.channelId, msg.id);
		return await reply(msg, result.error ?? result.success!);
	}

	public async chatInputList(interaction: Command.ChatInputCommandInteraction) {
		const reminders = this.getReminderList(interaction.user.id);
		if (reminders.length === 0) {
			return interaction.reply({ content: 'You have no active reminders.', ephemeral: true });
		}

		return interaction.reply({
			content:
				`You have ${reminders.length} active reminders:` +
				`\n${reminders
					.map(
						(reminder, index) =>
							`${index + 1}. ${reminder.reminderText} - ${time(Math.floor(reminder.timestamp / 1000), TimestampStyles.RelativeTime)}`
					)
					.join('\n')}`,
			ephemeral: true
		});
	}

	public async messageList(msg: Message) {
		const reminders = this.getReminderList(msg.author.id);
		if (reminders.length === 0) {
			return reply(msg, 'You have no active reminders.');
		}

		return reply(
			msg,
			`You have ${reminders.length} active reminders:` +
				`\n${reminders
					.map(
						(reminder, index) =>
							`${index + 1}. ${reminder.reminderText} - to be reminded ${time(Math.floor(reminder.timestamp / 1000), TimestampStyles.RelativeTime)}`
					)
					.join('\n')}`
		);
	}

	public async chatInputRemove(interaction: Command.ChatInputCommandInteraction) {
		const reminderId = interaction.options.getInteger('id', true);
		const result = this.removeReminder(interaction.user.id, reminderId);

		if (!result) {
			return await interaction.reply({
				content: 'Reminder not found.',
				ephemeral: true
			});
		}

		return await interaction.reply({
			content: result.error ?? result.success!,
			ephemeral: true
		});
	}

	public async messageRemove(msg: Message, args: Args) {
		const reminderId = await args.pick('number').catch(() => null);
		if (reminderId === null) {
			return reply(msg, 'Please provide a valid reminder ID to remove.');
		}
		const result = this.removeReminder(msg.author.id, reminderId);

		if (!result) {
			return reply(msg, 'Reminder not found.');
		}

		return await reply(msg, result.error ?? result.success!);
	}

	private createReminder(
		user_id: string,
		reminderText: string,
		timeStr: string,
		guild_id: string | undefined,
		channel_id: string,
		message_id?: string
	) {
		const duration = new Duration(timeStr);
		if (!duration.offset || duration.offset <= 0) {
			return { error: 'Invalid time format. Use formats like: `30m`, `2h`, `1d`, `1w`' };
		}

		if (duration.offset < 1 * Time.Minute) {
			return { error: 'Reminder must be at least 1 minute in the future.' };
		}

		const reminderTime = Date.now() + duration.offset;
		const db = getReminderDatabase();
		db.addReminder(user_id, reminderText, reminderTime, guild_id, channel_id, message_id);

		return { success: `I will remind you ${time(Math.floor(reminderTime / 1000), TimestampStyles.RelativeTime)}!\n> ${reminderText}` };
	}

	private removeReminder(user_id: string, reminder_id: number) {
		const db = getReminderDatabase();
		const reminder = db.getUserReminder(reminder_id, user_id);
		if (!reminder) {
			return { error: 'Reminder not found.' };
		}

		db.deleteReminder(reminder_id, user_id);
		return { success: 'Reminder removed successfully.' };
	}

	private getReminderList(user_id: string): Reminder[] {
		const db = getReminderDatabase();
		const reminders = db.getUserReminders(user_id);
		return reminders;
	}
}
