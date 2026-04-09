import { Reminder } from '#tasks/reminder';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Duration } from '@sapphire/time-utilities';
import { ApplicationIntegrationType, InteractionContextType, Message, MessageFlags, time, TimestampStyles } from 'discord.js';
import moment from 'moment';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];

function formatReminderTime(offsetMs: number, futureMs: number): string {
	if (offsetMs <= 60_000) {
		return `in ${moment.duration(offsetMs).format('d[d] h[h] m[m] s[s]')}`;
	}
	return time(Math.floor(futureMs / 1000), TimestampStyles.RelativeTime);
}

function formatDuration(d: Duration): string {
	const units: [number, string][] = [
		[d.months, 'month'],
		[d.weeks, 'week'],
		[d.days, 'day'],
		[d.hours, 'hour'],
		[d.minutes, 'minute'],
		[d.seconds, 'second']
	];
	return units
		.filter(([n]) => n)
		.map(([n, unit]) => `${n} ${unit}${n > 1 ? 's' : ''}`)
		.join(', ');
}
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Subcommand.Options>({
	aliases: ['remind-me', 'remind', 'notify-me', 'notify', 'rm'],
	generateDashLessAliases: true,
	description: 'Set a reminder to be notified later',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	flags: ['public', 'p', 'here', 'h'],
	options: ['repeat', 'r'],
	subcommands: [
		{
			name: 'create',
			messageRun: 'reminderCreateMsg',
			chatInputRun: 'reminderCreateSlash',
			default: true
		},
		{
			name: 'remove',
			messageRun: 'reminderRemoveMsg',
			chatInputRun: 'reminderRemoveSlash'
		},
		{
			name: 'list',
			messageRun: 'reminderListMsg',
			chatInputRun: 'reminderListSlash'
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
				.addBooleanOption((option) =>
					option //
						.setName('here')
						.setDescription('Whether to remind you here instead of DMing you')
				)
				.addStringOption((option) =>
					option //
						.setName('repeat')
						.setDescription('The interval at which to repeat the reminder (e.g., "6h", "2w", "1m")')
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
	public async reminderCreateSlash(interaction: Command.ChatInputCommandInteraction) {
		const timeStr = interaction.options.getString('time', true);
		const content = interaction.options.getString('message', true);
		const isPublic = interaction.options.getBoolean('public') ?? false;
		const repeatInterval = interaction.options.getString('repeat');

		const result = await this.createReminder(interaction, timeStr, content, isPublic, repeatInterval ?? undefined);

		return await interaction.reply({
			content: result.error ?? result.success,
			flags: MessageFlags.Ephemeral
		});
	}

	public async reminderRemoveSlash(interaction: Command.ChatInputCommandInteraction) {
		const id = interaction.options.getInteger('id', true);

		try {
			await this.removeReminderById(interaction.user.id, id);
			return interaction.reply({ content: `Removed reminder #${id}.`, flags: MessageFlags.Ephemeral });
		} catch {
			return interaction.reply({
				content: `Could not find a reminder with ID #${id}. Use the \`${this.name} list\` command to see your active reminders.`,
				flags: MessageFlags.Ephemeral
			});
		}
	}

	public async reminderListSlash(interaction: Command.ChatInputCommandInteraction) {
		const lines = await this.listReminders(interaction.user.id);
		if (lines.length === 0) {
			return interaction.reply({ content: 'You have no active reminders.', flags: MessageFlags.Ephemeral });
		}
		return interaction.reply({ content: `You have ${lines.length} active reminders:\n${lines.join('\n')}`, flags: MessageFlags.Ephemeral });
	}

	public async reminderCreateMsg(msg: Message, args: Args) {
		const timeStr = await args.pick('string').catch(() => null);
		const content = await args.rest('string').catch(() => null);
		const isPublic = args.getFlags('public', 'p', 'here', 'h');
		const repeatInterval = args.getOption('repeat', 'r');

		if (!timeStr && !content) {
			return this.reminderListMsg(msg);
		}

		if (!timeStr) {
			return reply(msg, 'Please provide a time (e.g., `30m`, `2h`, `1d`)');
		}

		if (!content) {
			return await reply(msg, 'Please provide a reminder message');
		}

		const result = await this.createReminder(msg, timeStr, content, isPublic, repeatInterval ?? undefined);
		return await reply(msg, result.error ?? result.success);
	}

	public async reminderRemoveMsg(msg: Message, args: Args) {
		const id = await args.pick('number').catch(() => null);
		if (id === null) {
			return this.reminderListMsg(msg);
		}

		try {
			await this.removeReminderById(msg.author.id, id);
			return reply(msg, `Removed reminder #${id}.`);
		} catch {
			return reply(msg, `Could not find a reminder with ID #${id}. Use the \`${this.name} list\` command to see your active reminders.`);
		}
	}

	public async reminderListMsg(msg: Message) {
		const lines = await this.listReminders(msg.author.id);
		if (lines.length === 0) {
			return reply(msg, 'You have no active reminders.');
		}
		return reply(msg, `You have ${lines.length} active reminders:\n${lines.join('\n')}`);
	}

	//#region Helper
	private async createReminder(
		ctx: Message | Command.ChatInputCommandInteraction,
		timeStr: string,
		content: string,
		isPublic: boolean,
		repeatInterval?: string
	) {
		const duration = new Duration(timeStr);

		if (!duration.offset || duration.offset <= 0) {
			return { error: 'Invalid time format. Use formats like: `30m`, `2h`, `1d`, `1w`' };
		}

		const now = Date.now();
		const payload: Reminder = {
			authorId: 'user' in ctx ? ctx.user.id : ctx.author.id,
			content,
			timestamp: now + duration.offset,
			guildId: ctx.guild ? ctx.guild.id : null,
			channelId: ctx.channel!.id,
			public: isPublic,
			messageId: ctx.id,
			createdAt: now
		};

		const reminderTime = formatReminderTime(duration.offset, now + duration.offset);

		if (repeatInterval) {
			return this.createRepeatedReminder(payload, duration, repeatInterval, content, reminderTime);
		}

		await this.container.tasks.create({ name: 'reminder', payload }, duration.offset);
		return { success: `I will remind you ${reminderTime}!\n> ${content}` };
	}

	private async createRepeatedReminder(payload: Reminder, duration: Duration, repeatInterval: string, content: string, reminderTime: string) {
		const interval = new Duration(repeatInterval);
		const intervalOffset = interval.offset;

		if (!intervalOffset || Number.isNaN(intervalOffset) || intervalOffset <= 0) {
			return { error: 'Invalid repeat format. Use formats like: `30m`, `2h`, `1d`, `1w`' };
		}

		await this.container.tasks.create(
			{ name: 'reminder', payload },
			{ repeated: true, interval: intervalOffset, customJobOptions: { delay: duration.offset } }
		);

		return { success: `I will remind you every ${formatDuration(interval)} starting ${reminderTime}!\n> ${content}` };
	}

	private async listReminders(userId: string) {
		const jobs = await this.container.tasks.list({ types: ['delayed', 'waiting'], asc: true });

		const reminderJobs = jobs.filter((job) => job.name === 'reminder');
		const userJobs = reminderJobs.filter((job) => (job.data as Reminder).authorId === userId);

		return userJobs.map((job, index) => {
			const data = job.data as Reminder;
			const scheduledAt = Math.floor((job.timestamp + job.delay) / 1000);
			return `${index + 1}. ${data.content} - ${time(scheduledAt, TimestampStyles.RelativeTime)}`;
		});
	}

	private async removeReminderById(userId: string, id: number) {
		const jobs = await this.container.tasks.list({ types: ['delayed', 'waiting'], asc: true });
		const reminderJobs = jobs.filter((job) => job.name === 'reminder');
		const userJobs = reminderJobs.filter((job) => (job.data as Reminder).authorId === userId);

		if (id < 1 || id > userJobs.length) {
			throw new Error('Invalid reminder ID');
		}

		const job = userJobs[id - 1];
		if (job.repeatJobKey) {
			return await (this.container.tasks.client as any).removeRepeatableByKey(job.repeatJobKey);
		}

		return await job.remove();
	}
	//#endregion
}
