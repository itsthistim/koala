import { PermissionFlagsBits } from "discord.js";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { tables } from "#lib/db";
import { uwuify } from "#lib/util";

const { FollowedUsers, FollowedGuilds } = tables;

export class UserCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: "owo",
			aliases: ["owoify", "uwu", "uwuify"],
			requiredUserPermissions: [],
			requiredClientPermissions: [PermissionFlagsBits.ManageWebhooks],
			preconditions: [],
			nsfw: false,
			description: "owo what's this?",
			detailedDescription: "Gives text or users the uwu treatment.",
			usage: "<this|me|them|everyone> [text|user]",
			examples: ["this how are you", "me", "them @user"],
			subcommands: [
				{
					name: "missingArgs",
					messageRun: "msgMissingArgs",
					default: true
				},
				{
					name: "this",
					messageRun: "msgThis",
					chatInputRun: "slashThis"
				},
				{
					name: "me",
					messageRun: "msgMe",
					chatInputRun: "slashMe"
				},
				{
					name: "them",
					messageRun: "msgThem",
					chatInputRun: "slashThem"
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) => subcommand.setName("me").setDescription("uwuify your messages. run again to disable"))
				.addSubcommand((subcommand) => subcommand.setName("everyone").setDescription("uwuify everyone's messages. run again to disable"))
				.addSubcommand((subcommand) =>
					subcommand
						.setName("this")
						.setDescription("uwuify a string")
						.addStringOption((option) => option.setName("text").setDescription("string to uwuify").setRequired(true))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("them")
						.setDescription("uwuify someone's messages. run again to disable")
						.addUserOption((option) => option.setName("user").setDescription("user to uwuify").setRequired(true))
				)
		);
	}

	uwuify(text) {
		return uwuify(text);
	}

	async followUser(user, guild) {
		const existingEntry = await FollowedUsers.findOne({ where: { user_id: user.id, guild_id: guild.id } });

		if (existingEntry !== null) {
			await FollowedUsers.destroy({ where: { user_id: user.id, guild_id: guild.id } });
			return false;
		}

		await FollowedUsers.create({ user_id: user.id, guild_id: guild.id });
		return true;
	}

	// Missing Args
	async msgMissingArgs(message) {
		await message.reply({
			content: "you need to provide a valid subcommand\nsubcommands: `this`, `me`, `them`, `everyone`",
			allowedMentions: { repliedUser: false }
		});
	}

	// This
	async slashThis(interaction) {
		const text = interaction.options.getString("text");
		await interaction.reply(this.uwuify(text));
	}

	async msgThis(message, args) {
		const text = await args.rest("string");
		await message.reply({ content: this.uwuify(text), allowedMentions: { repliedUser: false } });
	}

	// Me
	async slashMe(interaction) {
		const user = interaction.user;
		const guild = interaction.guild;

		if (user.bot) {
			return await interaction.reply({ content: "I can't uwuify bots", ephemeral: true });
		}

		const isFollowing = await this.followUser(user, guild);
		return await interaction.reply({
			content: isFollowing ? "uwuifying your messages" : "no more uwuifying for you",
			ephemeral: true
		});
	}

	async msgMe(message, args) {
		const user = message.author;
		const guild = message.guild;

		if (user.bot) {
			return await interaction.reply({ content: "I can't uwuify bots", ephemeral: true });
		}

		const isFollowing = await this.followUser(user, guild);
		return await message.reply({
			content: isFollowing ? "uwuifying your messages" : "no more uwuifying for you",
			allowedMentions: { repliedUser: false }
		});
	}

	// Them
	async slashThem(interaction) {
		const user = await interaction.options.getUser("user");
		const guild = interaction.guild;

		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return await interaction.reply({ content: "you need the `Manage Messages` permission to uwuify others", ephemeral: true });
		}

		if (user.bot) {
			return await interaction.reply({ content: "I can't uwuify bots", ephemeral: true });
		}

		const isFollowing = await this.followUser(user, guild);
		return await interaction.reply({
			content: isFollowing ? `uwuifying ${user.username}'s messages` : `no more uwuifying for ${user.username}`,
			ephemeral: true
		});
	}

	async msgThem(message, args) {
		const member = await args.pick("member");
		const guild = message.guild;

		if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return await interaction.reply({ content: "you need the `Manage Messages` permission to uwuify others", ephemeral: true });
		}

		if (member.user.bot) {
			return await interaction.reply({ content: "I can't uwuify bots", ephemeral: true });
		}

		const isFollowing = await this.followUser(member.user, guild);
		return await message.reply({
			content: isFollowing ? `uwuifying ${member.user.username}'s messages` : `no more uwuifying for ${member.user.username}`,
			allowedMentions: { repliedUser: false }
		});
	}

	// Everyone
	async slashEveryone(interaction) {
		return await interaction.reply({ content: "this is still being worked on! this will be available soon!", ephemeral: true });
	}

	async msgEveryone(message, args) {
		return await message.reply({ content: "this is still being worked on! this will be available soon!", allowedMentions: { repliedUser: false } });
	}
}
