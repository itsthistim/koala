import '#lib/setup';

import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';

import { GatewayIntentBits } from 'discord.js';

import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-editable-commands/register';
// import '@sapphire/plugin-scheduled-tasks/register-redis';

import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';

import parse from 'parse-duration';
import mysql from 'mysql2';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

momentDurationFormat(moment);

let prefixes = [];
if (process.env.NODE_ENV === 'PRODUCTION') {
	prefixes = ['-'];
} else {
	prefixes = ['+'];
}

const client = new SapphireClient({
	defaultPrefix: prefixes,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution
	],
	defaultCooldown: {
		delay: Time.Second * 10,
		limit: 2,
		filteredUsers: process.env.OWNERS.split(','),
		scope: BucketScope.User
	},
	allowedMentions: { repliedUser: true },
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	loadMessageCommandListeners: true,
	logger: { level: LogLevel.Info },
	partials: ['CHANNEL'],
	shards: 'auto'
});

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

client.distube = new DisTube(client, {
	emitNewSongOnly: true,
	leaveOnStop: true,
	leaveOnEmpty: true,
	emptyCooldown: 10,
	leaveOnFinish: false,
	savePreviousSongs: true,
	searchSongs: 1, // 1 -> play first result; 0 -> play all results
	searchCooldown: 60,
	emptyCooldown: 60,
	nsfw: false,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	youtubeCookie: process.env.YT_COOKIE,
	plugins: [new YtDlpPlugin()]
	// customFilters: []
});

//#region Globals
global.COLORS = {
	DEFAULT: 0x9bacb4,
	RED: 0xef4948,
	GREEN: 0x2ecc71,
	BLACK: 0x000000,
	WHITE: 0xffffff,
	BLURPLE: 0x5865f2,
	BLURPLE_CLASSIC: 0x7289da,
	GREYPLE: 0x99aab5,
	DARK_BUT_NOT_BLACK: 0x2c2f33,
	NOT_QUITE_BLACK: 0x23272a
};

global.EMOJIS = {
	POSITIVE: '<:positive:856277382926827520>',
	NEGATIVE: '<:negative:856277382816858182>',
	NEUTRAL: '<:neutral:856277382896812042>',
	HOURGLASS: '⌛'
};

global.dbPool = pool.promise();
global.client = client;

parse['mo'] = parse['month'];
//#endregion

const main = async () => {
	try {
		client.logger.info('Logging in...');
		await client.login();
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();