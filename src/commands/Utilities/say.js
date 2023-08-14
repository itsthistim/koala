import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { send, reply } from '@sapphire/plugin-editable-commands';
import { uwuify } from 'owoify-js';

export class SayCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'say',
			aliases: ['say', 'echo'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: ['tts', 'owo', 'uwu', 'uvu', 'delete', 'del', 'd', 'embed', 'e', 'silent', 's'],
			options: [],
			nsfw: false,
			description: 'Says something.',
			detailedDescription:
				`Make the bot say something.` +
				`\n\n**Flags:**\n` +
				`\`-tts\` - Enabled Text To Speech for the message.\n` +
				`\`-owo\` - OWOifys the message.\n` +
				`\`-delete\` - Deletes the message that invoked the command.\n` +
				`\`-silent\` - Same as \`-delete\`\n` +
				`\`-embed\` - Embeds the message.`,
			usage: '',
			examples: ['']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder.setName(this.name).setDescription(this.description);
			},
			{
				guildIds: []
				// idHints: '123456789012345678'
			}
		);
	}

	async chatInputRun(interaction) {
		
	}

	async messageRun(message, args) {
		let text = await args.rest('string').catch(() => null);

		const tts = args.getFlags('tts');
		const doTTS = tts && message.member.permissions.has(PermissionFlagsBits.SendTTSMessages);

		const owo = args.getFlags('owo', 'uwu', 'uvu');
		const del = args.getFlags('delete', 'del', 'd', 'silent', 's');
		const isEmbed = args.getFlags('embed', 'e');


		if (!text) return reply(message, 'You did not provide anything for me to say!');
		if (text.length > 2000) return reply(message, 'Your text is too long!');

		if (owo) {
			text = uwuify(text);
		}

		if (isEmbed) {
			const embed = new EmbedBuilder();
			embed.setColor(COLORS.GREYPLE);
			embed.setDescription(text);

			if (del) {
				await message.delete().catch(() => {});
				return send(message, { embeds: [embed], allowedMentions: { parse: [], repliedUser: true } });
			} else {
				return reply(message, { embeds: [embed], allowedMentions: { parse: [], repliedUser: true } });
			}
		} else {
			if (del) {
				await message.delete().catch(() => {});
				return send(message, { content: text, tts: doTTS, allowedMentions: { parse: [], repliedUser: true } });
			} else {
				return reply(message, { content: text, tts: doTTS, allowedMentions: { parse: [], repliedUser: true } });
			}
		}
	}
}
