import dotenv from 'dotenv';

if (process.argv.includes('--production')) {
	process.env.NODE_ENV = 'PRODUCTION';
}

process.env.NODE_ENV ??= 'DEVELOPMENT';

dotenv.config({
	path: process.env.NODE_ENV === 'DEVELOPMENT' ? '.env.dev' : '.env.prod'
});

import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-subcommands/register';
import { inspect } from 'util';

console.info(`[INFO] Starting bot in ${process.env.NODE_ENV} mode...`);

momentDurationFormat(moment);
// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Set default inspection depth
inspect.defaultOptions.depth = 1;
