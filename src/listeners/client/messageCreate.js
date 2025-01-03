import { Listener } from "@sapphire/framework";
import { tables } from "#lib/db";
import { uwuify } from "#lib/util";

const FollowedUsers = tables.FollowedUsers;

export class UserEvent extends Listener {
	constructor(context, options = {}) {
		super(context, {
			...options
		});
	}

	run(message) {
		if (message.author.bot) return;

		if (message.content.match(/^[a-zA-Z0-9]/)) {
			FollowedUsers.findOne({
				where: {
					user_id: message.author.id,
					guild_id: message.guild.id
				}
			}).then(async (foundData) => {
				if (foundData) {
					const msgContent = message.content;
					const msgAttachments = message.attachments.map((attachment) => attachment.url);

					const uwuified = uwuify(msgContent);

					const channelWebhooks = await message.channel.fetchWebhooks();
					let webhook = channelWebhooks.find((webhook) => webhook.name === "koala");

					if (!webhook) {
						webhook = await message.channel.createWebhook({ name: "koala" }).catch(console.error);
					}

					webhook
						.send({
							content: uwuified,
							files: msgAttachments,
							username: message.author.displayName,
							avatarURL: message.author.displayAvatarURL()
						})
						.catch(() => {
							message.channel.send({ content: uwuified, files: msgAttachments });
						});

					return message.delete();
				}
			});
		}
	}
}
