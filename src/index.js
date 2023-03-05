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
	leaveOnStop: false,
	leaveOnEmpty: true,
	leaveOnFinish: false,
	savePreviousSongs: true,
	searchSongs: 0, // 1 <= 0, play first result
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
	BIN: '<:white_bin:1082028834657935390>',
	INFO: '<:white_info:1082028836843163719>',
	CHECK: '<:white_check:1082028833156374649>',
	PAUSE: '<:white_pause:1082029020822130760>',
	PLAY: '<:white_play:1082028992707711136>',
	STOP: '<:white_stop:1082029018213261342>',
	PLAYLIST: '<:white_playlist:1082028994251194411>',
	REPEATALL: '<:white_repeatall:1082028998109958174>',
	REPEATONE: '<:white_repeatone:1082029001306034287>',
	SHUFFLE: '<:white_shuffle:1082029006746030120>',
	REWIND: '<:white_rewind:1082029003814219980>',
	FORWARD: '<:white_speed:1082029015738617896>',
	SKIPBACK: '<:white_skipback:1082029009614930022>',
	SKIPFORWARD: '<:white_skipforward:1082029010839687269>',
	SUBTRACT: '<:white_subtract:1082028839024205964>',
	ADD: '<:white_add:1082028831843549204>',
	X: '<:white_x:1082028829213728788>',
	SOUNDCLOUD: '<:white_soundcloud:1082029012899090432>',
	YOUTUBE: '<:white_youtube:1082029019500908574>'
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
