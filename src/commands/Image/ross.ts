import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, InteractionContextType, type Message } from 'discord.js';
import { createAttachment } from '#utils/canvas';
import { loadImage } from 'canvas';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['bobross', 'bob-ross'],
	description: 'Makes Bob Ross draw an avatar or an image from a link.',
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
				.setDescription('The user to get the avatar from.')
				.setRequired(false)
		)
		.addStringOption((option) =>
			option //
				.setName('image')
				.setDescription('The image URL to draw.')
				.setRequired(false)
		)
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const image = interaction.options.getString('image');
		const user = interaction.options.getUser('user');

		let imageUrl: string;
		if (user) {
			imageUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
		} else if (image) {
			imageUrl = image;
		} else {
			imageUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 512 });
		}

		const attachment = await this.getImage(imageUrl);
		return interaction.reply({ files: [attachment] });
	}

	public override async messageRun(msg: Message, args: Args) {
		const url = await args.rest('string').catch(() => null);
		const user = await args.pick('userName').catch(() => null);

		let imageUrl: string;
		if (user) {
			imageUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
		} else if (url) {
			imageUrl = url.replace(/^<(.+)>$/, '$1');
		} else {
			imageUrl = msg.author.displayAvatarURL({ extension: 'png', size: 512 });
		}

		const attachment = await this.getImage(imageUrl);
		return reply(msg, { files: [attachment] });
	}

	private async getImage(image: string) {
		image = image
			.replace(/^<(.+)>$/, '$1') // remove < >
			.replace(/(\?|&)format=\w+/g, '') // remove format param
			.trim();

		const base = await loadImage('src/lib/assets/images/bob-ross.png');
		const data = await loadImage(image);

		return createAttachment(base.width, base.height, 'bob-ross.png', async (ctx) => {
			ctx.fillStyle = '#f0e8d3';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(data, 15, 23, 440, 440);
			ctx.drawImage(base, 0, 0);
		});
	}
}
