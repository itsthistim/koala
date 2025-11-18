import type { Collection, Snowflake, User, GuildMember, Channel, Role, Emoji, Guild } from 'discord.js';

/**
 * Resolves a user from a string, such as an ID, a name, or a mention.
 */
export function resolveUser(text: string, users: Collection<Snowflake, User>, caseSensitive = false, wholeWord = false): User | undefined {
	return users.get(text) || users.find((user) => checkUser(text, user, caseSensitive, wholeWord));
}

/**
 * Resolves multiple users from a string, such as an ID, a name, or a mention.
 */
export function resolveUsers(
	text: string,
	users: Collection<Snowflake, User>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, User> {
	return users.filter((user) => checkUser(text, user, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a user.
 */
export function checkUser(text: string, user: User, caseSensitive = false, wholeWord = false): boolean {
	if (user.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && user.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? user.username : user.username.toLowerCase();
	const discrim = user.discriminator;

	if (!wholeWord) {
		return username.includes(text) || (username.includes(text.split('#')[0]) && discrim.includes(text.split('#')[1]));
	}

	return username === text || (username === text.split('#')[0] && discrim === text.split('#')[1]);
}

/**
 * Resolves a member from a string, such as an ID, a name, or a mention.
 */
export function resolveMember(
	text: string,
	members: Collection<Snowflake, GuildMember>,
	caseSensitive = false,
	wholeWord = false
): GuildMember | undefined {
	return members.get(text) || members.find((member) => checkMember(text, member, caseSensitive, wholeWord));
}

/**
 * Resolves multiple members from a string, such as an ID, a name, or a mention.
 */
export function resolveMembers(
	text: string,
	members: Collection<Snowflake, GuildMember>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, GuildMember> {
	return members.filter((member) => checkMember(text, member, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a member.
 */
export function checkMember(text: string, member: GuildMember, caseSensitive = false, wholeWord = false): boolean {
	if (member.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && member.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
	const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
	const discrim = member.user.discriminator;

	if (!wholeWord) {
		return (
			displayName.includes(text) ||
			username.includes(text) ||
			((username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discrim.includes(text.split('#')[1]))
		);
	}

	return (
		displayName === text ||
		username === text ||
		((username === text.split('#')[0] || displayName === text.split('#')[0]) && discrim === text.split('#')[1])
	);
}

/**
 * Resolves a channel from a string, such as an ID, a name, or a mention.
 */
export function resolveChannel(
	text: string,
	channels: Collection<Snowflake, Channel>,
	caseSensitive = false,
	wholeWord = false
): Channel | undefined {
	return channels.get(text) || channels.find((channel) => checkChannel(text, channel, caseSensitive, wholeWord));
}

/**
 * Resolves multiple channels from a string, such as an ID, a name, or a mention.
 */
export function resolveChannels(
	text: string,
	channels: Collection<Snowflake, Channel>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Channel> {
	return channels.filter((channel) => checkChannel(text, channel, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a channel.
 */
export function checkChannel(text: string, channel: Channel, caseSensitive = false, wholeWord = false): boolean {
	if (channel.id === text) return true;

	const reg = /<#(\d{17,19})>/;
	const match = text.match(reg);

	if (match && channel.id === match[1]) return true;

	// DMChannel doesn't have a name property
	if (!('name' in channel)) return false;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? channel.name : (channel.name?.toLowerCase() ?? '');

	if (!name) return false;

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^#/, ''));
	}

	return name === text || name === text.replace(/^#/, '');
}

/**
 * Resolves a role from a string, such as an ID, a name, or a mention.
 */
export function resolveRole(text: string, roles: Collection<Snowflake, Role>, caseSensitive = false, wholeWord = false): Role | undefined {
	return roles.get(text) || roles.find((role) => checkRole(text, role, caseSensitive, wholeWord));
}

/**
 * Resolves multiple roles from a string, such as an ID, a name, or a mention.
 */
export function resolveRoles(
	text: string,
	roles: Collection<Snowflake, Role>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Role> {
	return roles.filter((role) => checkRole(text, role, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a role.
 */
export function checkRole(text: string, role: Role, caseSensitive = false, wholeWord = false): boolean {
	if (role.id === text) return true;

	const reg = /<@&(\d{17,19})>/;
	const match = text.match(reg);

	if (match && role.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? role.name : role.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^@/, ''));
	}

	return name === text || name === text.replace(/^@/, '');
}

/**
 * Resolves a custom emoji from a string, such as a name or a mention.
 */
export function resolveEmoji(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive = false, wholeWord = false): Emoji | undefined {
	return emojis.get(text) || emojis.find((emoji) => checkEmoji(text, emoji, caseSensitive, wholeWord));
}

/**
 * Resolves multiple custom emojis from a string, such as a name or a mention.
 */
export function resolveEmojis(
	text: string,
	emojis: Collection<Snowflake, Emoji>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Emoji> {
	return emojis.filter((emoji) => checkEmoji(text, emoji, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to an emoji.
 */
export function checkEmoji(text: string, emoji: Emoji, caseSensitive = false, wholeWord = false): boolean {
	if (emoji.id === text) return true;

	const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
	const match = text.match(reg);

	if (match && emoji.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? emoji.name : (emoji.name?.toLowerCase() ?? '');

	if (!name) return false;

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/:/, ''));
	}

	return name === text || name === text.replace(/:/, '');
}

/**
 * Resolves a guild from a string, such as an ID or a name.
 */
export function resolveGuild(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive = false, wholeWord = false): Guild | undefined {
	return guilds.get(text) || guilds.find((guild) => checkGuild(text, guild, caseSensitive, wholeWord));
}

/**
 * Resolves multiple guilds from a string, such as an ID or a name.
 */
export function resolveGuilds(
	text: string,
	guilds: Collection<Snowflake, Guild>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Guild> {
	return guilds.filter((guild) => checkGuild(text, guild, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a guild.
 */
export function checkGuild(text: string, guild: Guild, caseSensitive = false, wholeWord = false): boolean {
	if (guild.id === text) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? guild.name : guild.name.toLowerCase();

	if (!wholeWord) return name.includes(text);
	return name === text;
}
