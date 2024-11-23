import { Command, container } from "@sapphire/framework";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { reply } from "@sapphire/plugin-editable-commands";

export class BanCommand extends Command {
	constructor(context) {
		super(context, {
			name: "ban",
			aliases: ["banish"],
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
				.addUserOption((option) => option.setName("user").setDescription("The user to ban.").setRequired(true))
				.addStringOption((option) => option.setName("reason").setDescription("The reason for the ban.").setRequired(false));
		});
	}

	async chatInputRun(interaction, ctx) {
		const user = await interaction.options.getUser("user", true);
		let reason = interaction.options.getString("reason", false);

		if (!user) {
			return await interaction.reply({ content: "Please specify a user to ban.", ephemeral: true });
		}

		if (!reason) {
			reason = "No reason specified.";
		}

		this.banUser(interaction, user, reason).then((embed) => {
			interaction.reply({ embeds: [embed] });
		});
	}

	async messageRun(message, args, ctx) {
		const user = await args
			.pick("member")
			.catch(() => args.pick("user"))
			.catch(() => null);
		let reason = await args.rest("string").catch(() => null);

		if (!user) {
			return reply(message, {
				embeds: [new EmbedBuilder().setColor(container.colors.RED).setTitle("User Not Found").setDescription("Please specify a user to ban.").setTimestamp()]
			});
		}

		if (!reason) {
			reason = "No reason specified.";
		}

		this.banUser(message, user, reason).then((embed) => {
			reply(message, { embeds: [embed] });
		});
	}

	async banUser(interaction, user, reason) {
		if (user.bannable === false) {
			return new EmbedBuilder().setColor(container.colors.RED).setTitle("User Not Bannable").setDescription(`I cannot ban **${user.user.tag}** from the server.`);
		}

		// return await interaction.guild.bans.create(user.id, { reason: reason }).then((banInfo) => {
		return new EmbedBuilder()
			.setColor(container.colors.GREEN)
			.setTitle("User Banned")
			.setDescription(`**${user.tag ?? user.user.tag}** has been banned from the server.`)
			.addFields({ name: "Reason", value: reason, inline: true });
		// });
	}
}
