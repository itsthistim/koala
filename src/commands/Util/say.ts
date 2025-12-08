import { colors } from '#lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	aliases: ['s', 'echo', 'repeat'],
	description: 'Repeats the message you provide.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: [],
	flags: ['d', 'delete', 'tts', 'embed', 'e'],
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
			contexts
		});
	}

	public override async messageRun(msg: Message, args: Args) {
		const content = await args.rest('string');

		const deleteFlag = args.getFlags('delete', 'd');
		const embedFlag = args.getFlags('embed', 'e');
		const ttsFlag = args.getFlags('tts');
		const ttsAllowed = ttsFlag && msg.member?.permissions.has(PermissionFlagsBits.SendTTSMessages);

		if (deleteFlag) {
			await msg.delete().catch(() => {});
		}

		if (embedFlag) {
			const embed = new EmbedBuilder()
				.setColor(colors.default)
				.setDescription(content);
			return await send(msg, { embeds: [embed] });
		}

		return await send(msg, { content, tts: ttsAllowed, allowedMentions: { parse: [], repliedUser: true } });
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const content = interaction.options.getString('text', true);
		return interaction.reply({ content });
	}
}
