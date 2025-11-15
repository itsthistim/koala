import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Duration } from '@sapphire/duration';
import { ApplicationIntegrationType, InteractionContextType, time, TimestampStyles, type Message } from 'discord.js';
import { getReminderDatabase } from '#lib/database/reminders';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['remindme', 'reminder', 'notifyme', 'notify'],
	description: 'Set a reminder to be notified later',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addStringOption((option) =>
			option //
				.setName('time')
				.setDescription('When to remind you (e.g., "30m", "2h", "1d")')
				.setRequired(true)
		)
		.addStringOption((option) => option.setName('message').setDescription('What to remind you about').setRequired(true))
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const timeStr = interaction.options.getString('time', true);
		const message = interaction.options.getString('message', true);

		const result = this.createReminder(interaction.user.id, message, timeStr, interaction.channelId, interaction.guildId ?? undefined);

		return await interaction.reply({
			content: result.error ?? result.success!,
			ephemeral: true
		});
	}

	public override async messageRun(msg: Message, args: Args) {
		const timeStr = await args.pickResult('string');
		if (timeStr.isErr()) {
			return await reply(msg, '❌ Please provide a time (e.g., `30m`, `2h`, `1d`)');
		}

		const message = await args.restResult('string');
		if (message.isErr()) {
			return await reply(msg, '❌ Please provide a reminder message');
		}

		const result = this.createReminder(msg.author.id, message.unwrap(), timeStr.unwrap(), msg.channelId, msg.guildId ?? undefined, msg.id);

		return await reply(msg, result.error ?? result.success!);
	}

	private createReminder(userId: string, message: string, timeStr: string, channelId: string, guildId: string | undefined, messageId?: string) {
		const duration = new Duration(timeStr);
		if (!duration.offset || duration.offset <= 0) {
			return { error: '❌ Invalid time format. Use formats like: `30m`, `2h`, `1d`, `1w`' };
		}

		if (duration.offset < 60_000) {
			return { error: '❌ Reminder must be at least 1 minute in the future.' };
		}

		const reminderTime = Date.now() + duration.offset;
		const db = getReminderDatabase();
		db.addReminder(userId, message, reminderTime, channelId, guildId, messageId);

		return { success: `✅ I will remind you ${time(Math.floor(reminderTime / 1000), TimestampStyles.RelativeTime)}!\n> ${message}` };
	}
}
