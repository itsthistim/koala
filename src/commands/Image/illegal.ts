import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { loadImage, registerFont } from 'canvas';
import { createAttachment, fitText } from '#lib/utils/canvas';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['trump'],
	description: 'Make Trump declare something illegal.',
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
				.setDescription('The thing that Trump will declare illegal.')
				.setRequired(true)
		)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const text = interaction.options.getString('text') ?? `Invite ${this.container.client.user!.username}!`;
		const attachment = await this.getImage(text);
		return await interaction.reply({ files: [attachment] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const text = await args.rest('string').catch(() => `Invite ${this.container.client.user!.username}!`);
		const attachment = await this.getImage(text);
		return await reply(msg, { files: [attachment] });
	}

	private async getImage(text: string) {
		const base = await loadImage('src/lib/assets/images/illegal.png');
		registerFont('src/lib/assets/fonts/Roboto.ttf', { family: 'Roboto' });

		return createAttachment(base.width, base.height, 'illegal.png', async (ctx) => {
			ctx.drawImage(base, 0, 0);

			ctx.font = 'bold 28px Roboto';
			ctx.fillStyle = '#000000';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			const centerX = base.width / 2 + 300;
			const centerY = base.height / 2;

			ctx.fillText(fitText(ctx, text, 250, 100), centerX, centerY);
		});
	}
}
