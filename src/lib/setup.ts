import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-scheduled-tasks/register';
import { inspect } from 'util';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Set default inspection depth
inspect.defaultOptions.depth = 1;
