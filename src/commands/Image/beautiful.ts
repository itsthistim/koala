import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { loadImage } from 'canvas';
import { createAttachment } from '#utils/canvas';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	description: 'Now this, this is beautiful.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addUserOption((option) =>
			option //
				.setName('user')
				.setDescription('The user to get the avatar from')
				.setRequired(false)
		)
		.addAttachmentOption((option) =>
			option //
				.setName('image')
				.setDescription('The image to make beautiful')
				.setRequired(false)
		)
		.addStringOption((option) =>
			option //
				.setName('url')
				.setDescription('The image URL to make beautiful')
				.setRequired(false)
		)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const image = interaction.options.getString('url');
		const user = interaction.options.getUser('user');
		const attachmentInput = interaction.options.getAttachment('image');

		let imageUrl: string;
		if (user) {
			imageUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
		} else if (attachmentInput) {
			imageUrl = attachmentInput.url;
		} else if (image) {
			imageUrl = image;
		} else {
			imageUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 512 });
		}

		const attachment = await this.getImage(imageUrl);
		return await interaction.reply({ files: [attachment] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const user = await args.pick('userName').catch(() => null);
		const url = await args.rest('string').catch(() => null);

		let imageUrl: string;
		if (user) {
			imageUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
		} else if (url) {
			imageUrl = url.replace(/^<(.+)>$/, '$1');
		} else {
			imageUrl = msg.author.displayAvatarURL({ extension: 'png', size: 512 });
		}

		const attachment = await this.getImage(imageUrl);
		return await reply(msg, { files: [attachment] });
	}

	private async getImage(image: string) {
		image = image
			.replace(/^<(.+)>$/, '$1') // remove < >
			.replace(/([?&])format=\w+/g, '') // remove format param
			.trim();

		const base = await loadImage('src/lib/assets/images/beautiful.png');
		const data = await loadImage(image);

		return createAttachment(base.width, base.height, 'beautiful.png', async (ctx) => {
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(data, 249, 24, 105, 105);
			ctx.drawImage(data, 249, 223, 105, 105);
			ctx.drawImage(base, 0, 0);
		});
	}
}
