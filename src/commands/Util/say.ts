import { colors } from '#lib/constants';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, PermissionFlagsBits, type Message } from 'discord.js';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['s', 'echo', 'repeat'],
	description: 'Repeats the message you provide.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: [],
	flags: ['d', 'delete', 'tts', 'embed', 'e'],
	options: []
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addStringOption((option) => option.setName('message').setDescription('The message to repeat').setRequired(true))
		.addBooleanOption((option) => option.setName('embed').setDescription('Send as an embed').setRequired(false))
		.addBooleanOption((option) => option.setName('tts').setDescription('Send as TTS').setRequired(false))
)
export class UserCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const content = interaction.options.getString('message', true);
		const embedFlag = interaction.options.getBoolean('embed');
		const ttsFlag = interaction.options.getBoolean('tts');
		const ttsAllowed = ttsFlag && interaction.memberPermissions?.has(PermissionFlagsBits.SendTTSMessages);

		if (embedFlag) {
			const embed = new EmbedBuilder().setColor(colors.default).setDescription(content);
			return interaction.reply({ embeds: [embed] });
		}

		return interaction.reply({ content, tts: !!ttsAllowed });
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
			const embed = new EmbedBuilder().setColor(colors.default).setDescription(content);
			return await send(msg, { embeds: [embed] }); // tts not possible for embeds
		}

		return await send(msg, { content, tts: ttsAllowed, allowedMentions: { parse: [], repliedUser: true } });
	}
}
