import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { reply } from "@sapphire/plugin-editable-commands";

export class AvatarCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: "avatar",
			aliases: [""],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: "Shows the avatar of a user.",
			detailedDescription: "",
			usage: "@user#1234",
			examples: [""]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName("user").setDescription("The user to show the avatar of.").setRequired(false));
		});
	}

	getUserAvatar(member) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: member.user.username,
				iconURL: member.user.displayAvatarURL({ dynamic: true })
			})
			.setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }));

		return embed;
	}

	async chatInputRun(interaction) {
		const member = (await interaction.options.getMember("user")) ?? interaction.guild.members.cache.get(interaction.user.id);
		const embed = this.getUserAvatar(member);
		await interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		var member = await args.pick("member").catch(() => message.member);
		const embed = this.getUserAvatar(member);
		await reply(message, { embeds: [embed] });
	}
}
