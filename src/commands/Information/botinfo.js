import { container, Command, version as sappVersion } from "@sapphire/framework";
import { EmbedBuilder, version as djsVersion } from "discord.js";
import { reply } from "@sapphire/plugin-editable-commands";
import moment from "moment";

export class BotInfoCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "botinfo",
			aliases: ["about", "stats", "ping", "uptime", "status"],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Shows information about the bot, including the bot's uptime, ping, and more."
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description);
		});
	}

	async chatInputRun(interaction, ctx) {
		const embed = await this.createInfoEmbed(interaction);
		return interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args, ctx) {
		const embed = await this.createInfoEmbed(message);
		return reply(message, { embeds: [embed] });
	}

	async createInfoEmbed(interaction) {
		const dev = container.client.users.cache.get("319183644331606016");
		const uptime = moment.duration(container.client.uptime).format("d[d], h[h], m[m], s[s]");

		return new EmbedBuilder()
			.setColor(container.colors.DEFAULT)
			.setAuthor({
				name: container.client.user.username,
				iconURL: container.client.user.displayAvatarURL({ dynamic: true })
			})
			.addFields(
				{
					name: "Technical",
					value: `**Uptime:** ${uptime}\n` + `**Ping:** ${container.client.ws.ping}ms\n` + `**Roundtrip:** ${Date.now() - interaction.createdTimestamp}ms`,
					inline: true
				},
				{
					name: "Versions",
					value: `**Node.js:** ${process.version}\n**Discord.js:** ${djsVersion}\n**Sapphire:** ${sappVersion}`,
					inline: true
				},
				{
					name: "Discord",
					value: `**Guilds:** ${container.client.guilds.cache.size}\n**Channels:** ${container.client.channels.cache.size}\n**Users:** ${container.client.users.cache.size}`,
					inline: true
				}
			)
			.setFooter({
				text: `Made by ${dev.username}`,
				iconURL: dev.displayAvatarURL({ dynamic: true })
			});
	}
}
