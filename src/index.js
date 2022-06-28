require('dotenv').config();
require('@sapphire/plugin-editable-commands/register');
const { Intents } = require('discord.js');
const { SapphireClient, BucketScope, container } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { createConnection } = require('mysql');
const { Player } = require("discord-player");
const { Lyrics } = require("@discord-player/extractor");
const parse = require('parse-duration');

let prefixes = [];
if (!process.env.DEV) {
	prefixes = ['-'];
} else {
	prefixes = ['+'];
}

const client = new SapphireClient({
	defaultPrefix: prefixes,
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		// 'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_INVITES',
		// 'GUILD_INTEGRATIONS',
		// 'GUILD_WEBHOOKS',
		'GUILD_PRESENCES',
		'GUILD_MESSAGES',
		// 'GUILD_MESSAGE_REACTIONS',
		// 'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		// 'DIRECT_MESSAGE_REACTIONS',
		// 'DIRECT_MESSAGE_TYPING',
		// 'MESSAGE_CONTENT',
		// 'GUILD_SCHEDULED_EVENTS',
		// 'AUTO_MODERATION_CONFIGURATION',
		// 'AUTO_MODERATION_EXECUTION'
	],
	allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true },
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true
});

global.COLORS = {
	DEFAULT: 0xeaff00,
	RED: 0xEF4948,
	GREEN: 0x2ECC71,
	BLACK: 0x000000,
	WHITE: 0xFFFFFF,
	BLURPLE: 0x5865F2,
	BLURPLE_CLASSIC: 0x7289DA,
	GREYPLE: 0x99AAB5,
	DARK_BUT_NOT_BLACK: 0x2C2F33,
	NOT_QUITE_BLACK: 0x23272A
};

global.EMOJIS = {
	POSITIVE: '<:success:965326609018142825>',
	NEGATIVE: '<:error:965326651850358804>',
	NEUTRAL: '<:neutral:856277382896812042>',
	HOURGLASS: '⌛'
};

global.PLAYER = new Player(client);
global.LYRICS = Lyrics.init(/*process.env.GENIUS_TOKEN*/);
parse['mo'] = parse['month'];

// global.DB = createConnection({
// 	host: '127.0.0.1',
// 	user: 'root',
// 	password: '',
// 	database: 'koala_db',
// });

// DB.connect(function (err) {
// 	if (err) {
// 		console.error('error connecting: ' + err.stack);
// 		return;
// 	}
// 	console.log(`Successfully connected to ${DB.config.database}.`);
// });

// DB.query(`SELECT value FROM config WHERE settingId = 1 AND guildId = '502208815937224715';`, function (error, results, fields) {
// 	results.forEach(item => {
// 		console.log(item.value);
// 	});
// });

client.login();