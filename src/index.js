import "#lib/setup";
import { SapphireClient, BucketScope } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";
import { Time } from "@sapphire/time-utilities";
import fs from "fs";
// import { DisTube } from "distube";
// import { YouTubePlugin } from "@distube/youtube";

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
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.AutoModerationConfiguration, GatewayIntentBits.AutoModerationExecution],
	allowedMentions: { repliedUser: true },
	loadMessageCommandListeners: true,
	partials: [Partials.Channel],
	shards: "auto"
});

// client.distube = new DisTube(client, {
// 	emitNewSongOnly: true,
// 	leaveOnStop: false,
// 	leaveOnFinish: false,
// 	leaveOnEmpty: true,
// 	emptyCooldown: 3,
// 	savePreviousSongs: true,
// 	searchSongs: 0,
// 	searchCooldown: 60,
// 	nsfw: false,
// 	emitAddSongWhenCreatingQueue: false,
// 	emitAddListWhenCreatingQueue: false,
// 	youtubeCookie: process.env.YT_COOKIE,
// 	plugins: [new YouTubePlugin({ cookies: JSON.parse(fs.readFileSync("../cookies.json")) })]
// });

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
	client.logger.info("Logged in!");
});
