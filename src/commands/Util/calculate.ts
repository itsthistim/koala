import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['calc', 'c', 'math'],
	description: 'Calculates a mathematical expressions.',
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
		.addStringOption((option) =>
			option //
				.setName('expression')
				.setDescription('The mathematical expression to calculate.')
				.setRequired(true)
		)
)
export class UserCommand extends Command {
	public override async messageRun(msg: Message, args: Args) {
		const expression = await args.rest('string');
		let result: number;

		try {
			const { evaluate } = await import('mathjs');
			result = Number(evaluate(expression));
		} catch (error) {
			return reply(msg, `**ERROR**: Invalid expression.`);
		}

		return reply(msg, `**Result**: ${result}`);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const expression = interaction.options.getString('expression');
		if (!expression) return interaction.reply({ content: `**ERROR**: No expression provided.`, flags: MessageFlags.Ephemeral });

		let result: number;
		try {
			const { evaluate } = await import('mathjs');
			result = Number(evaluate(expression));
		} catch (error) {
			return interaction.reply({ content: `**ERROR**: Invalid expression.`, flags: MessageFlags.Ephemeral });
		}

		return interaction.reply({ content: `**Result**: ${result}`, flags: MessageFlags.Ephemeral });
	}
}
