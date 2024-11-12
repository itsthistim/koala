import "#lib/setup";
import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";

let prefixes = [];
if (process.env.NODE_ENV === "PRODUCTION") {
	prefixes.push("-");
} else {
	prefixes.push("+");
}

const client = new SapphireClient({
	defaultPrefix: prefixes,
	caseInsensitivePrefixes: true,
	caseInsensitiveCommands: true,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution
	],
	allowedMentions: { repliedUser: false },
	loadMessageCommandListeners: true,
	partials: [Partials.Channel],
	shards: "auto"
});

const main = async () => {
	try {
		client.logger.info("Logging in...");
		await client.login();
	} catch (error) {
		console.error(error);
		await client.destroy();
		process.exit(1);
	}
};

main().then(() => {
	client.logger.info("Logged in as " + client.user.tag);
});
