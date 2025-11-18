import { container, Argument, type ArgumentResult } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { User } from 'discord.js';
import { resolveUser } from '#lib/utils/discord';

export default class UserNameArgument extends Argument<User> {
	public async run(parameter: string, context: Argument.Context): Promise<ArgumentResult<User>> {
		const users = container.client.users.cache.sort((a, b) => a.username.localeCompare(b.username));
		let value = resolveUser(parameter, users);

		// if user couldn't be resolved from cache, try to fetch by ID
		if (isNullish(value) && /^\d{17,19}$/.test(parameter)) {
			try {
				value = await container.client.users.fetch(parameter);
			} catch {
				container.logger.info(`Failed to fetch user with ID: ${parameter}`);
			}
		}

		// if still not found and in a guild, search guild members by username
		if (isNullish(value) && 'guild' in context.message && context.message.guild) {
			try {
				const members = await context.message.guild.members.search({ query: parameter, limit: 1 });
				if (members.size > 0) {
					// get first member's user, sorted by username
					value = members.sort((a, b) => a.user.username.localeCompare(b.user.username)).first()!.user;
				}
			} catch {
				container.logger.info(`Failed to search guild members with username: ${parameter}`);
			}
		}

		if (!isNullish(value)) {
			return this.ok(value);
		}

		return this.error({
			parameter,
			message: 'The provided argument could not be resolved to a user.',
			identifier: 'InvalidUser'
		});
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		userName: User;
	}
}
