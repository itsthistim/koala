import 'dotenv/config';
import '#lib/database';
import { container, ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-editable-commands/register';
import { createColors } from 'colorette';
import { inspect } from 'node:util';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

// Application Command Registry Options
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// if (process.env.NODE_ENV === 'DEVELOPMENT') {
// 	ApplicationCommandRegistries.setDefaultGuildIds(['502208815937224715']);
// }

// Inspect Depth
inspect.defaultOptions.depth = 1;

// Enable Colorette Colors
createColors({ useColor: true });

// Enable Moment Duration Format
momentDurationFormat(moment);

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

container.color = {
	DEFAULT: 0x9bacb4,
	GREEN: 0x87de7f,
	RED: 0x8e3741,
	BLURPLE: 0x5865f2,
	BLURPLE_CLASSIC: 0x7289da,
	GREYPLE: 0x99aab5,
	DARK_BUT_NOT_BLACK: 0x2c2f33,
	NOT_QUITE_BLACK: 0x23272a,
	BLACK: 0x000000,
	WHITE: 0xffffff
};

container.emoji = {
	POSITIVE: '<:positive:1017154150464753665>',
	NEGATIVE: '<:negative:1017154192525250590>',
	NEUTRAL: '<:neutral:1017154199735259146>',
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
