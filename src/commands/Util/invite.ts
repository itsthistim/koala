import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { container, Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	description: 'Get an invite link to add the bot to your server.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const inviteLink = this.getInviteLink();
		return await interaction.reply({ content: `Invite me to your server using this link: ${inviteLink}`, flags: MessageFlags.Ephemeral });
	}

	public override async messageRun(msg: Message) {
		const inviteLink = this.getInviteLink();
		return await reply(msg, { content: `Invite me to your server using this link: ${inviteLink}` });
	}

	private getInviteLink(): string {
		return `https://discord.com/oauth2/authorize?client_id=${container.client.user!.id}&permissions=8&scope=bot%20applications.commands`;
	}
}
