import { colors } from '#lib/constants';
import { envParseArray } from '#utils/env';
import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, container, version as sappVersion } from '@sapphire/framework';
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, User, version as djsVersion, type Message } from 'discord.js';
import { DurationFormatter } from '@sapphire/time-utilities';
import { reply } from '@sapphire/plugin-editable-commands';
import os from 'os';
import { execSync } from 'child_process';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Command.Options>({
	aliases: ['stats', 'bot-info'],
	description: 'Shows information about the bot.',
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
		const embed = await this.getInfoEmbed();
		return interaction.reply({ embeds: [embed] });
	}

	public override async messageRun(msg: Message) {
		const embed = await this.getInfoEmbed();
		return reply(msg, { embeds: [embed] });
	}

	private async getInfoEmbed() {
		const dev = container.client.users.cache.get(envParseArray('OWNERS')[0]) as User | undefined;
		const uptime = new DurationFormatter().format(container.client.uptime!);

		const diskUsage = (() => {
			try {
				if (os.platform() === 'win32') {
					// Windows
					const output = execSync(
						`powershell -Command "(Get-ChildItem -Path '${__dirname}' -Recurse | Measure-Object -Property Length -Sum).Sum"`,
						{ encoding: 'utf-8' }
					);
					const sizeBytes = parseInt(output.trim());
					if (sizeBytes === 0 || isNaN(sizeBytes)) return null;
					const sizeMB = sizeBytes / 1024 / 1024;
					return sizeMB > 1024 ? `${(sizeMB / 1024).toFixed(2)}GB` : `${sizeMB.toFixed(2)}MB`;
				} else {
					// UNIX-like
					const output = execSync(`du -sb "${__dirname}"`, { encoding: 'utf-8' });
					const sizeBytes = parseInt(output.split('\t')[0]);
					if (sizeBytes === 0) return null;
					const sizeMB = sizeBytes / 1024 / 1024;
					return sizeMB > 1024 ? `${(sizeMB / 1024).toFixed(2)}GB` : `${sizeMB.toFixed(2)}MB`;
				}
			} catch {
				return null;
			}
		})();

		const guildCount = container.client.guilds.cache.size;
		let channelCount = 0;
		let userCount = 0;

		for (const guild of container.client.guilds.cache.values()) {
			channelCount += guild.channels.cache.size;
			userCount += guild.memberCount;
		}

		let embed = new EmbedBuilder() //
			.setColor(colors.default)
			.setAuthor({
				name: container.client.user!.username,
				iconURL: container.client.user!.displayAvatarURL()
			})
			.addFields(
				{
					name: 'Technical',
					value:
						`**Uptime:** ${uptime}\n` + //
						`**Memory:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\n` +
						`**Disk Usage:** ${diskUsage || 'N/A'}`,
					inline: true
				},
				{
					name: 'Versions',
					value:
						`**Node.js:** ${process.version}\n` + //
						`**Discord.js:** ${djsVersion}\n` +
						`**Sapphire:** ${sappVersion}`,
					inline: true
				},
				{
					name: 'Discord',
					value:
						`**Guilds:** ${guildCount}\n` + //
						`**Channels:** ${channelCount}\n` +
						`**Users:** ${userCount}`,
					inline: true
				}
			);

		if (dev) {
			embed.setFooter({
				text: `Made by ${dev.username}`,
				iconURL: dev.displayAvatarURL()
			});
		}

		return embed;
	}
}
