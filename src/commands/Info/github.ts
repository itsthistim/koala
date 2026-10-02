import { availability } from '#lib/constants';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	aliases: ['gh'],
	description: 'Sends a link to the bots GitHub repository.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...availability.anywhere.contexts)
		.setIntegrationTypes(...availability.anywhere.integrationTypes)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply({ content: '[GitHub Repository](https://github.com/itsthistim/koala)' });
	}

	public override async messageRun(msg: Message) {
		return reply(msg, '[GitHub Repository](https://github.com/itsthistim/koala)');
	}
}
