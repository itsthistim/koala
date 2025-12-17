import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

const answers = [
	'Yes.',
	'Definitely.',
	'It is certain.',
	'Without a doubt.',
	'Yes, definitely.',
	'Signs point to yes.',
	'Most likely.',
	'Outlook good.',

	'No.',
	'Absolutely not.',
	'My reply is no.',
	'Very doubtful.',
	'My sources say no.',
	'Outlook not so good.',
	'No, definitely not.',
	"Don't count on it.",

	'Maybe.',
	'Ask again later.',
	'Cannot predict now.',
	'Concentrate and ask again.',
	'Reply hazy, try again.'
];

@ApplyOptions<Command.Options>({
	aliases: ['8ball', 'magische-miesmuschel', 'magischemiesmuschel', 'magic-mussel', 'random-answer', 'oracle'],
	description: 'Get a random answer to your question',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: [],
	flags: [],
	options: []
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addStringOption((option) => option.setName('message').setDescription('The question you want to ask').setRequired(false))
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const answer = answers[Math.floor(Math.random() * answers.length)];
		return interaction.reply({ content: answer });
	}

	public override async messageRun(msg: Message) {
		const answer = answers[Math.floor(Math.random() * answers.length)];

		// if user replied to a message, reply to that message
		if (msg.reference?.messageId) {
			const referencedMessage = await msg.channel.messages.fetch(msg.reference.messageId).catch(() => null);
			if (referencedMessage) {
				return referencedMessage.reply({ content: answer });
			}
		}

		return reply(msg, { content: answer });
	}
}
