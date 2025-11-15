import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { loadImage } from 'canvas';
import { shortenText, createAttachment } from '#utils/canvas';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['achievement'],
	description: 'Send a minecraft advancement with any text.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addStringOption((option) =>
			option //
				.setName('text')
				.setDescription('The text to display on the advancement.')
				.setRequired(true)
		)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const text = interaction.options.getString('text') ?? `Invite ${this.container.client.user!.username}!`;
		let attachment = await this.getImage(text);
		return await interaction.reply({ files: [attachment] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const text = await args.rest('string').catch(() => `Invite ${this.container.client.user!.username}!`);
		let attachment = await this.getImage(text);
		return await reply(msg, { files: [attachment] });
	}

	private async getImage(text: string) {
		const base = await loadImage('src/lib/assets/images/achievement.png');

		return createAttachment(base.width, base.height, 'advancement.png', async (ctx) => {
			ctx.drawImage(base, 0, 0);
			ctx.font = '20px Mojangles';
			ctx.fillStyle = '#ffff00';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(shortenText(ctx, text, 250), 60, 50);
		});
	}
}
