import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

let mathInstance: any = null;

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

		let result: unknown;

		try {
			result = await this.safeEvaluate(expression);
		} catch (error: any) {
			return reply(
				msg,
				`**ERROR**: ${
					error.message || 'Invalid expression'
				}.\nView supported functions [here](<https://mathjs.org/docs/reference/functions.html>) (do not prepend \`math.\`).`
			);
		}

		return reply(msg, `**Result**: ${result}`);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const expression = interaction.options.getString('expression');
		if (!expression) return interaction.reply({ content: `**ERROR**: No expression provided.`, flags: MessageFlags.Ephemeral });

		let result: unknown;
		try {
			result = await this.safeEvaluate(expression);
		} catch (error: any) {
			return interaction.reply({
				content: `**ERROR**: ${
					error.message || 'Invalid expression'
				}.\nView supported functions [here](<https://mathjs.org/docs/reference/functions.html>) (do not prepend \`math.\`).`,
				flags: MessageFlags.Ephemeral
			});
		}

		return interaction.reply({ content: `**Result**: ${result}`, flags: MessageFlags.Ephemeral });
	}

	private async getMath() {
		if (mathInstance) return mathInstance;
		const { create, all } = await import('mathjs');
		mathInstance = create(all);
		return mathInstance;
	}

	private async safeEvaluate(expression: string) {
		const math = await this.getMath();
		const node = math.parse(expression);

		node.traverse((child: any) => {
			if (child.type === 'AssignmentNode' || child.type === 'FunctionAssignmentNode') {
				throw new Error('Assignments are not allowed.');
			}
			if (child.type === 'SymbolNode') {
				const name = child.name;
				if (['import', 'config', 'create', 'evaluate', 'parse', 'compile', 'help'].includes(name)) {
					throw new Error(`Function '${name}' is disabled.`);
				}
			}
		});

		return node.compile().evaluate({});
	}
}
