import { availability } from '#lib/constants';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: "Shows the bot's latency and API response time.",
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: []
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...availability.anywhere.contexts)
		.setIntegrationTypes(...availability.anywhere.integrationTypes)
)
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		const msg = await reply(message, 'Pinging...');
		const latency = (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp);

		return reply(message, this.formatPong(latency));
	}

	public override chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.runPingInteraction(interaction);
	}

	public override contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
		return this.runPingInteraction(interaction);
	}

	private async runPingInteraction(interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction) {
		await interaction.reply({ content: 'Pinging...' });
		const msg = await interaction.fetchReply();

		return interaction.editReply({ content: this.formatPong(msg.createdTimestamp - interaction.createdTimestamp) });
	}

	private formatPong(apiLatency: number) {
		return `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${apiLatency}ms.`;
	}
}
