import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType, MessageFlags, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	aliases: ['calc', 'c', 'math'],
	description: 'Calculates a mathematical expressions.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: [],
	flags: [],
	options: []
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
		const contexts: InteractionContextType[] = [
			InteractionContextType.BotDM,
			InteractionContextType.Guild,
			InteractionContextType.PrivateChannel
		];

		registry.registerChatInputCommand({
			name: this.name,
			description: this.description,
			integrationTypes,
			contexts,
			options: [
				{
					name: 'expression',
					description: 'The mathematical expression to calculate.',
					type: ApplicationCommandOptionType.String,
					required: true
				}
			]
		});
	}

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
