import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Duration } from '@sapphire/time-utilities';
import { ApplicationIntegrationType, InteractionContextType, Message, time, TimestampStyles } from 'discord.js';
import { Reminder } from 'scheduled-tasks/reminder';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Subcommand.Options>({
	aliases: ['remindme', 'remind', 'notifyme', 'notify', 'rm'],
	description: 'Set a reminder to be notified later',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	subcommands: [
		{
			name: 'create',
			chatInputRun: 'chatInputRemind',
			messageRun: 'messageRemind',
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
	public async chatInputRemind(interaction: Command.ChatInputCommandInteraction) {
		const timeStr = interaction.options.getString('time', true);
		const content = interaction.options.getString('message', true);

		const result = this.createReminder(interaction, timeStr, content);

		return await interaction.reply({
			content: result.error ?? result.success!,
			ephemeral: true
		});
	}

	public async chatInputList(interaction: Command.ChatInputCommandInteraction) {
		const lines = await this.listReminders(interaction.user.id);
		if (lines.length === 0) {
			return interaction.reply({ content: 'You have no active reminders.', ephemeral: true });
		}
		return interaction.reply({ content: `You have ${lines.length} active reminders:\n${lines.join('\n')}`, ephemeral: true });
	}

	public async messageRemind(msg: Message, args: Args) {
		const timeStr = await args.pick('string').catch(() => null);
		const content = await args.rest('string').catch(() => null);

		if (!timeStr && !content) {
			return this.messageList(msg);
		}

		if (!timeStr) {
			return reply(msg, 'Please provide a time (e.g., `30m`, `2h`, `1d`)');
		}

		if (!content) {
			return await reply(msg, 'Please provide a reminder message');
		}

		const result = this.createReminder(msg, timeStr, content);
		return await reply(msg, result.error ?? result.success!);
	}

	public async messageList(msg: Message) {
		const lines = await this.listReminders(msg.author.id);
		if (lines.length === 0) {
			return reply(msg, 'You have no active reminders.');
		}
		return reply(msg, `You have ${lines.length} active reminders:\n${lines.join('\n')}`);
	}

	private createReminder(ctx: Message | Command.ChatInputCommandInteraction, timeStr: string, content: string) {
		const duration = new Duration(timeStr);
		if (!duration.offset || duration.offset <= 0) {
			return { error: 'Invalid time format. Use formats like: `30m`, `2h`, `1d`, `1w`' };
		}

		const now = Date.now();
		const payload: Reminder = {
			author: 'user' in ctx ? ctx.user : ctx.author,
			content,
			timestamp: now + duration.offset,
			ctx
		};

		this.container.tasks.create({ name: 'reminder', payload }, duration.offset);

		const reminderTime = Date.now() + duration.offset;
		return { success: `I will remind you ${time(Math.floor(reminderTime / 1000), TimestampStyles.RelativeTime)}!\n> ${content}` };
	}

	private async listReminders(userId: string) {
		const jobs = await this.container.tasks.list({ types: ['delayed', 'waiting'], asc: true });

		const reminderJobs = jobs.filter((job) => job.name === 'reminder');
		const userJobs = reminderJobs.filter((job) => (job.data as Reminder).author.id === userId);

		return userJobs.map((job, index) => {
			const data = job.data as Reminder;
			return `${index + 1}. ${data.content} - ${time(Math.floor(data.timestamp / 1000), TimestampStyles.RelativeTime)}`;
		});
	}
}
