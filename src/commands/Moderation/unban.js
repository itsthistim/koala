import { Command, container } from "@sapphire/framework";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { reply } from "@sapphire/plugin-editable-commands";

export class UnbanCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "unban",
			aliases: ["pardon"],
			requiredUserPermissions: [PermissionFlagsBits.BanMembers],
			requiredClientPermissions: [PermissionFlagsBits.BanMembers],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Bans a user from the server.",
			detailedDescription: "",
			usage: "<user> [reason]",
			examples: ["@user#1234 spamming"]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
			.setName(this.name)
			.setDescription(this.description)
			.addUserOption((option) => option.setName("user").setDescription("The user to unban.").setRequired(true))
			.addStringOption((option) => option.setName("reason").setDescription("The reason for the unban.").setRequired(false));
		});
	}

	async chatInputRun(interaction) {
		var user = await interaction.options.getUser("user", true);
		var reason = await interaction.options.getString("reason", false);

		if (!user) {
			return reply(interaction, {
				embeds: [new EmbedBuilder().setColor(container.colors.RED).setTitle("User Not Found").setDescription("Please specify a user to ban.")]
			});
		}

		if (!reason) {
			reason = "No reason specified.";
		}

		this.unbanUser(interaction, user, reason).then((embed) => {
			reply(interaction, { embeds: [embed] });
		});
	}

	async messageRun(message, args) {
		var user = await args
		.pick("member")
		.catch(() => args.pick("user"))
		.catch(() => null);
		var reason = await args.rest("string").catch(() => null);

		if (!user) {
			return reply(message, {
				embeds: [new EmbedBuilder().setColor(container.colors.RED).setTitle("User Not Found").setDescription("Please specify a user to unban.")]
			});
		}

		if (!reason) {
			reason = "No reason specified.";
		}

		this.unbanUser(message, user, reason).then((embed) => {
			reply(message, { embeds: [embed] });
		});
	}

	async unbanUser(interaction, user, reason) {
		if (user.member) {
			return new EmbedBuilder()
			.setColor(container.colors.RED)
			.setTitle("User Not Banned")
			.setDescription(`**${user.tag ?? user.user.tag}** is not banned.`);
		}

		// return await interaction.guild.bans.create(user.id, { reason: reason }).then((banInfo) => {
		return new EmbedBuilder()
		.setColor(container.colors.GREEN)
		.setTitle("User Unbanned")
		.setDescription(`**${user.tag ?? user.user.tag}** has been unbanned.`)
		.addFields({ name: "Reason", value: reason, inline: true });
		// });
	}
}
