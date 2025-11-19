import '#lib/setup';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new SapphireClient({
	defaultPrefix: process.env.NODE_ENV === 'production' ? '-' : '+',
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitivePrefixes: true,
	caseInsensitiveCommands: true,
	allowedMentions: { repliedUser: true },
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	tasks: {
		bull: {
			connection: {
				host: process.env.REDIS_HOST,
				port: Number(process.env.REDIS_PORT),
				username: process.env.REDIS_USERNAME,
				password: process.env.REDIS_PASSWORD
			}
		}
	}
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
