const schedule = require('node-schedule');
require('dotenv').config();
require('@sapphire/plugin-editable-commands/register');
const { Intents } = require('discord.js');
const { SapphireClient, BucketScope, container } = require('@sapphire/framework');
// const { ScheduledTaskRedisStrategy } = require('@sapphire/plugin-scheduled-tasks/register-redis');
const { DisTube } = require('distube')
const { YtDlpPlugin } = require('@distube/yt-dlp')

const { Time } = require('@sapphire/time-utilities');
const { createConnection } = require('mysql');
const parse = require('parse-duration');


let prefixes = [];
if (!process.env.DEV) {
	prefixes = ['-'];
} else {
	prefixes = ['+'];
}

// global.DB = createConnection({
// 	host: process.env.DB_HOST,
// 	user: process.env.DB_USER,
// 	password: process.env.DB_PASSWORD,
// 	database: process.env.DB_DATABASE,
// });

// DB.connect(function (err) {
// 	if (err) {
// 		console.error('error connecting: ' + err.stack);
// 		return;
// 	}
// 	console.log(`Successfully connected to ${DB.config.database}.`);
// });

// DB.query(`SELECT value FROM guild_config WHERE settingId = 1 AND guildId = '502208815937224715';`, function (error, results, fields) {
// 	results.forEach(item => {
// 		console.log(item.value);
// 	});
// });

const client = new SapphireClient({
	defaultPrefix: prefixes,
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_INVITES',
		'GUILD_INTEGRATIONS',
		'GUILD_WEBHOOKS',
		'GUILD_PRESENCES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS',
		'DIRECT_MESSAGE_TYPING',
		'MESSAGE_CONTENT',
		'GUILD_SCHEDULED_EVENTS'
		],
	allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true },
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	loadMessageCommandListeners: true,
	// tasks: {
	// 	strategy: new ScheduledTaskRedisStrategy({
	// 		bull: {
	// 			connection: {
	// 				host: process.env.REDIS_HOST,
	// 				username: process.env.REDIS_USER,
	// 				password: process.env.REDIS_PASSWORD,
	// 				port: process.env.REDIS_PORT,
	// 				db: process.env.REDIS_DATABASES,
	// 			}
	// 		}
	// 	})
	// }
});

client.distube = new DisTube(client, {
	emitNewSongOnly: true,
	leaveOnStop: false,
	leaveOnEmpty: true,
	leaveOnFinish: false,
	leaveOnStop: false,
	savePreviousSongs: true,
	searchSongs: 1, // < 1 -> play first result
	searchCooldown: 60,
	emptyCooldown: 60,
	nsfw: false,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: false,
	youtubeCookie: process.env.YT_COOKIE,
	youtubeDL: false,
	updateYouTubeDL: false,
	plugins: [
		new YtDlpPlugin()
	],
	// customFilters: []
})

global.COLORS = {
	DEFAULT: 0x9BACB4,
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
	POSITIVE: '<:positive:856277382926827520>',
	NEGATIVE: '<:negative:856277382816858182>',
	NEUTRAL: '<:neutral:856277382896812042>',
	HOURGLASS: '⌛'
};

// global.PLAYER = new Player(client);
// global.LYRICS = Lyrics.init(/*process.env.GENIUS_TOKEN*/);

parse['mo'] = parse['month'];

const monthly_idiots = schedule.scheduleJob('0 15 1 * *', async function () {
	console.log('monthly_idiots triggered @', new Date().toLocaleString());

	const guild = this.container.client.guilds.cache.get('988912269909966938');
	const channel = guild.channels.cache.get('988925360332755004');

	const idiotRole = guild.roles.cache.get('999792913569558658');
	const idiots = guild.members.cache.filter(member => member.roles.cache.has(idiotRole.id));
	const idiotList = idiots.map(member => member.user.tag).join('\n');

	const msg = `This month there has been **${idiots.size} idiots** in <#999791567533527160>.\nNone of them can count and they should be ashamed of themselves.\nHere they are:`;


	const paste = await this.getPaste(idiotList, 'Idiots');
	const attachment = {
		attachment: Buffer.from(idiotList),
		name: 'idiots.txt',
		description: 'Idiots that can\'t count.'
	}

	channel.send({ content: msg, files: [attachment] });

	idiots.forEach(member => {
		member.roles.remove(idiotRole).catch(err => console.log(err));
	});
});

client.login();
