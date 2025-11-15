import { shortenText } from '#utils/canvas';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { createCanvas, loadImage } from 'canvas';
import { ApplicationIntegrationType, AttachmentBuilder, InteractionContextType, type Message } from 'discord.js';

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
		let attachment = await this.createImage(text);
		interaction.reply({ files: [attachment] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const text = await args.rest('string').catch(() => `Invite ${this.container.client.user!.username}!`);
		let attachment = await this.createImage(text);
		reply(msg, { files: [attachment] });
	}

	private async createImage(text: string): Promise<AttachmentBuilder> {
		try {
			const base = await loadImage('src/lib/assets/images/achievement.png');
			const canvas = createCanvas(base.width, base.height);

			const ctx = canvas.getContext('2d');
			ctx.drawImage(base, 0, 0);
			ctx.font = '20px Mojangles';
			ctx.fillStyle = '#ffff00';
			ctx.fillStyle = '#ffffff';
			ctx.fillText(shortenText(ctx, text, 250), 60, 50);
			let attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e6) {
				throw new Error('Generated image exceeds 8MB size limit');
			}

			return new AttachmentBuilder(attachment, { name: 'advancement.png' });
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
