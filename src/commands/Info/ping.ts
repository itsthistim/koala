import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [
	InteractionContextType.BotDM,
	InteractionContextType.Guild,
	InteractionContextType.PrivateChannel
];

@ApplyOptions<Command.Options>({
	description: "Shows the bot's latency and API response time.",
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: []
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
)
export class UserCommand extends Command {

	public override async messageRun(message: Message) {
		const msg = await reply(message, 'Pinging...');

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
		}ms.`;

		return reply(message, content);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.reply({ content: 'Pinging...' });
		const msg = await interaction.fetchReply();

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			msg.createdTimestamp - interaction.createdTimestamp
		}ms.`;

		return interaction.editReply({ content });
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		await interaction.reply({ content: 'Pinging...' });
		const msg = await interaction.fetchReply();

		const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
			msg.createdTimestamp - interaction.createdTimestamp
		}ms.`;

		return interaction.editReply({ content });
	}
}
