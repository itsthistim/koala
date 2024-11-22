/**
 * Resolves a user from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, User>} users - Collection of users to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {User}
 */
export function resolveUser(text, users, caseSensitive = false, wholeWord = false) {
	return users.get(text) || users.find((user) => checkUser(text, user, caseSensitive, wholeWord));
}

/**
 * Resolves multiple users from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, User>} users - Collection of users to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, User>}
 */
export function resolveUsers(text, users, caseSensitive = false, wholeWord = false) {
	return users.filter((user) => checkUser(text, user, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a user.
 * @param {string} text - Text to check.
 * @param {User} user - User to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkUser(text, user, caseSensitive = false, wholeWord = false) {
	if (user.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && user.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? user.username : user.username.toLowerCase();
	const discrim = user.discriminator;

	if (!wholeWord) {
		return username.includes(text) || (username.includes(text.split("#")[0]) && discrim.includes(text.split("#")[1]));
	}

	return username === text || (username === text.split("#")[0] && discrim === text.split("#")[1]);
}

/**
 * Resolves a member from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {GuildMember}
 */
export function resolveMember(text, members, caseSensitive = false, wholeWord = false) {
	return members.get(text) || members.find((member) => checkMember(text, member, caseSensitive, wholeWord));
}

/**
 * Resolves multiple members from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, GuildMember>}
 */
export function resolveMembers(text, members, caseSensitive = false, wholeWord = false) {
	return members.filter((member) => checkMember(text, member, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a member.
 * @param {string} text - Text to check.
 * @param {GuildMember} member - Member to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkMember(text, member, caseSensitive = false, wholeWord = false) {
	if (member.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && member.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
	const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
	const discrim = member.user.discriminator;

	if (!wholeWord) {
		return displayName.includes(text) || username.includes(text) || ((username.includes(text.split("#")[0]) || displayName.includes(text.split("#")[0])) && discrim.includes(text.split("#")[1]));
	}

	return displayName === text || username === text || ((username === text.split("#")[0] || displayName === text.split("#")[0]) && discrim === text.split("#")[1]);
}

/**
 * Resolves a channel from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Channel}
 */
export function resolveChannel(text, channels, caseSensitive = false, wholeWord = false) {
	return channels.get(text) || channels.find((channel) => checkChannel(text, channel, caseSensitive, wholeWord));
}

/**
 * Resolves multiple channels from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, Channel>}
 */
export function resolveChannels(text, channels, caseSensitive = false, wholeWord = false) {
	return channels.filter((channel) => checkChannel(text, channel, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a channel.
 * @param {string} text - Text to check.
 * @param {Channel} channel - Channel to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkChannel(text, channel, caseSensitive = false, wholeWord = false) {
	if (channel.id === text) return true;

	const reg = /<#(\d{17,19})>/;
	const match = text.match(reg);

	if (match && channel.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? channel.name : channel.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^#/, ""));
	}

	return name === text || name === text.replace(/^#/, "");
}

/**
 * Resolves a role from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Role}
 */
export function resolveRole(text, roles, caseSensitive = false, wholeWord = false) {
	return roles.get(text) || roles.find((role) => checkRole(text, role, caseSensitive, wholeWord));
}

/**
 * Resolves multiple roles from a string, such as an ID, a name, or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, Role>}
 */
export function resolveRoles(text, roles, caseSensitive = false, wholeWord = false) {
	return roles.filter((role) => checkRole(text, role, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a role.
 * @param {string} text - Text to check.
 * @param {Role} role - Role to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkRole(text, role, caseSensitive = false, wholeWord = false) {
	if (role.id === text) return true;

	const reg = /<@&(\d{17,19})>/;
	const match = text.match(reg);

	if (match && role.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? role.name : role.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^@/, ""));
	}

	return name === text || name === text.replace(/^@/, "");
}

/**
 * Resolves a custom emoji from a string, such as a name or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Emoji}
 */
export function resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
	return emojis.get(text) || emojis.find((emoji) => checkEmoji(text, emoji, caseSensitive, wholeWord));
}

/**
 * Resolves multiple custom emojis from a string, such as a name or a mention.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, Emoji>}
 */
export function resolveEmojis(text, emojis, caseSensitive = false, wholeWord = false) {
	return emojis.filter((emoji) => checkEmoji(text, emoji, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a emoji.
 * @param {string} text - Text to check.
 * @param {Emoji} emoji - Emoji to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
	if (emoji.id === text) return true;

	const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
	const match = text.match(reg);

	if (match && emoji.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/:/, ""));
	}

	return name === text || name === text.replace(/:/, "");
}

/**
 * Resolves a guild from a string, such as an ID or a name.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Guild}
 */
export function resolveGuild(text, guilds, caseSensitive = false, wholeWord = false) {
	return guilds.get(text) || guilds.find((guild) => checkGuild(text, guild, caseSensitive, wholeWord));
}

/**
 * Resolves multiple guilds from a string, such as an ID or a name.
 * @param {string} text - Text to resolve.
 * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
 * @returns {Collection<Snowflake, Guild>}
 */
export function resolveGuilds(text, guilds, caseSensitive = false, wholeWord = false) {
	return guilds.filter((guild) => checkGuild(text, guild, caseSensitive, wholeWord));
}

/**
 * Checks if a string could be referring to a guild.
 * @param {string} text - Text to check.
 * @param {Guild} guild - Guild to check.
 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
 * @returns {boolean}
 */
export function checkGuild(text, guild, caseSensitive = false, wholeWord = false) {
	if (guild.id === text) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? guild.name : guild.name.toLowerCase();

	if (!wholeWord) return name.includes(text);
	return name === text;
}

/**
 * Resolves the indefinite article for a word.
 * @param {string} word - Word to resolve.
 * @returns {string} - 'a' or 'an'.
 */
export function getIndefiniteArticle(word) {
	const vowels = ["a", "e", "i", "o", "u"];
	const firstLetter = word.charAt(0).toLowerCase();
	return vowels.includes(firstLetter) ? "an" : "a";
}

/**
 * Shortens a text.
 * @param {string} input Input string
 * @param {number} from Start index
 * @param {number} to End index
 * @param {boolean} ending Should the string end with '...'?
 * @returns Formatted string
 */
export function fitTo(input, maxLength = 250, ending = false) {
	if (input.length >= maxLength) {
		input = input.trim();
		return input.substring(0, maxLength - (ending ? 3 : 0)) + (ending ? "..." : "");
	}
	return input;
}

/**
 * Wraps a string to fit into a certain length.
 * @param {string} input String to be wrapped
 * @param {number} length Length of each line
 * @returns Wrapped string
 */
export async function softWrap(input, length = 30) {
	const wrap = input.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, "g"), "$1\n");
	return wrap;
}

/**
 * Capitalizes a given string.
 * @param {string} toCapitalize String to capitalize.
 * @return {string} capitalized string
 */
export async function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Picks a random element from an array and returns it.
 * @param {Array} array Array to pick from.
 * @return a random item
 */
export async function pickRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}
