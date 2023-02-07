import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish, isNullishOrZero } from '@sapphire/utilities';
import { getIdHints } from '#lib/idHints';
import * as fs from 'fs';

import globPkg from 'glob';
const { glob } = globPkg;

export class ClientUtil {
	/**
	 * Resolves a user from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, User>} users - Collection of users to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {User}
	 */
	static resolveUser(text, users, caseSensitive = false, wholeWord = false) {
		return users.get(text) || users.find((user) => this.checkUser(text, user, caseSensitive, wholeWord));
	}

	/**
	 * Resolves the indefinite article for a word.
	 * @param {string} word - Word to resolve.
	 * @returns {string} - 'a' or 'an'.
	 */
	static getIndefiniteArticle(word) {
		const vowels = ['a', 'e', 'i', 'o', 'u'];
		const firstLetter = word.charAt(0).toLowerCase();
		return vowels.includes(firstLetter) ? 'an' : 'a';
	}

	/**
	 * Resolves multiple users from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, User>} users - Collection of users to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, User>}
	 */
	static resolveUsers(text, users, caseSensitive = false, wholeWord = false) {
		return users.filter((user) => this.checkUser(text, user, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a user.
	 * @param {string} text - Text to check.
	 * @param {User} user - User to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkUser(text, user, caseSensitive = false, wholeWord = false) {
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
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {GuildMember}
	 */
	static resolveMember(text, members, caseSensitive = false, wholeWord = false) {
		return members.get(text) || members.find((member) => this.checkMember(text, member, caseSensitive, wholeWord));
	}

	/**
	 * Resolves multiple members from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, GuildMember>} members - Collection of members to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, GuildMember>}
	 */
	static resolveMembers(text, members, caseSensitive = false, wholeWord = false) {
		return members.filter((member) => this.checkMember(text, member, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a member.
	 * @param {string} text - Text to check.
	 * @param {GuildMember} member - Member to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkMember(text, member, caseSensitive = false, wholeWord = false) {
		if (member.id === text) return true;

		const reg = /<@!?(\d{17,19})>/;
		const match = text.match(reg);

		if (match && member.id === match[1]) return true;

		text = caseSensitive ? text : text.toLowerCase();
		const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
		const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
		const discrim = member.user.discriminator;

		if (!wholeWord) {
			return displayName.includes(text) || username.includes(text) || ((username.includes(text.split('#')[0]) || displayName.includes(text.split('#')[0])) && discrim.includes(text.split('#')[1]));
		}

		return displayName === text || username === text || ((username === text.split('#')[0] || displayName === text.split('#')[0]) && discrim === text.split('#')[1]);
	}

	/**
	 * Resolves a channel from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Channel}
	 */
	static resolveChannel(text, channels, caseSensitive = false, wholeWord = false) {
		return channels.get(text) || channels.find((channel) => this.checkChannel(text, channel, caseSensitive, wholeWord));
	}

	/**
	 * Resolves multiple channels from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Channel>} channels - Collection of channels to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, Channel>}
	 */
	static resolveChannels(text, channels, caseSensitive = false, wholeWord = false) {
		return channels.filter((channel) => this.checkChannel(text, channel, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a channel.
	 * @param {string} text - Text to check.
	 * @param {Channel} channel - Channel to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkChannel(text, channel, caseSensitive = false, wholeWord = false) {
		if (channel.id === text) return true;

		const reg = /<#(\d{17,19})>/;
		const match = text.match(reg);

		if (match && channel.id === match[1]) return true;

		text = caseSensitive ? text : text.toLowerCase();
		const name = caseSensitive ? channel.name : channel.name.toLowerCase();

		if (!wholeWord) {
			return name.includes(text) || name.includes(text.replace(/^#/, ''));
		}

		return name === text || name === text.replace(/^#/, '');
	}

	/**
	 * Resolves a role from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Role}
	 */
	static resolveRole(text, roles, caseSensitive = false, wholeWord = false) {
		return roles.get(text) || roles.find((role) => this.checkRole(text, role, caseSensitive, wholeWord));
	}

	/**
	 * Resolves multiple roles from a string, such as an ID, a name, or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Role>} roles - Collection of roles to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, Role>}
	 */
	static resolveRoles(text, roles, caseSensitive = false, wholeWord = false) {
		return roles.filter((role) => this.checkRole(text, role, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a role.
	 * @param {string} text - Text to check.
	 * @param {Role} role - Role to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkRole(text, role, caseSensitive = false, wholeWord = false) {
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
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Emoji}
	 */
	static resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
		return emojis.get(text) || emojis.find((emoji) => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
	}

	/**
	 * Resolves multiple custom emojis from a string, such as a name or a mention.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Emoji>} emojis - Collection of emojis to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, Emoji>}
	 */
	static resolveEmojis(text, emojis, caseSensitive = false, wholeWord = false) {
		return emojis.filter((emoji) => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a emoji.
	 * @param {string} text - Text to check.
	 * @param {Emoji} emoji - Emoji to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
		if (emoji.id === text) return true;

		const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
		const match = text.match(reg);

		if (match && emoji.id === match[1]) return true;

		text = caseSensitive ? text : text.toLowerCase();
		const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

		if (!wholeWord) {
			return name.includes(text) || name.includes(text.replace(/:/, ''));
		}

		return name === text || name === text.replace(/:/, '');
	}

	/**
	 * Resolves a guild from a string, such as an ID or a name.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Guild}
	 */
	static resolveGuild(text, guilds, caseSensitive = false, wholeWord = false) {
		return guilds.get(text) || guilds.find((guild) => this.checkGuild(text, guild, caseSensitive, wholeWord));
	}

	/**
	 * Resolves multiple guilds from a string, such as an ID or a name.
	 * @param {string} text - Text to resolve.
	 * @param {Collection<Snowflake, Guild>} guilds - Collection of guilds to find in.
	 * @param {boolean} [caseSensitive=false] - Makes finding by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes finding by name match full word only.
	 * @returns {Collection<Snowflake, Guild>}
	 */
	static resolveGuilds(text, guilds, caseSensitive = false, wholeWord = false) {
		return guilds.filter((guild) => this.checkGuild(text, guild, caseSensitive, wholeWord));
	}

	/**
	 * Checks if a string could be referring to a guild.
	 * @param {string} text - Text to check.
	 * @param {Guild} guild - Guild to check.
	 * @param {boolean} [caseSensitive=false] - Makes checking by name case sensitive.
	 * @param {boolean} [wholeWord=false] - Makes checking by name match full word only.
	 * @returns {boolean}
	 */
	static checkGuild(text, guild, caseSensitive = false, wholeWord = false) {
		if (guild.id === text) return true;

		text = caseSensitive ? text : text.toLowerCase();
		const name = caseSensitive ? guild.name : guild.name.toLowerCase();

		if (!wholeWord) return name.includes(text);
		return name === text;
	}

	/**
	 * Array of permission names.
	 * @returns {string[]}
	 */
	static permissionNames() {
		return Object.keys(Permissions.FLAGS);
	}

	/**
	 * Resolves a permission number and returns an array of permission names.
	 * @param {number} number - The permissions number.
	 * @returns {string[]}
	 */
	static resolvePermissionNumber(number) {
		const resolved = [];

		for (const key of Object.keys(Permissions.FLAGS)) {
			if (number & Permissions.FLAGS[key]) resolved.push(key);
		}

		return resolved;
	}

	/**
	 * Compares two member objects presences and checks if they stopped or started a stream or not.
	 * Returns `0`, `1`, or `2` for no change, stopped, or started.
	 * @param {GuildMember} oldMember - The old member.
	 * @param {GuildMember} newMember - The new member.
	 * @returns {number}
	 */
	static compareStreaming(oldMember, newMember) {
		const s1 = oldMember.presence?.activities.find((c) => c.type === 'STREAMING');
		const s2 = newMember.presence?.activities.find((c) => c.type === 'STREAMING');
		if (s1 === s2) return 0;
		if (s1) return 1;
		if (s2) return 2;
		return 0;
	}

	/**
	 * Combination of `<Client>.users.fetch()` and `<Guild>.members.fetch()`.
	 * @param {Guild} guild - Guild to fetch in.
	 * @param {string} id - ID of the user.
	 * @param {boolean} cache - Whether or not to add to cache.
	 * @returns {Promise<GuildMember>}
	 */
	static async fetchMember(guild, id, cache) {
		const user = await this.container.client.users.fetch(id, cache);
		return guild.members.fetch(user, cache);
	}
}

/**
 * Shortens a text.
 * @param {string} input Input string
 * @param {number} from Start index
 * @param {number} to End index
 * @param {boolean} ending Should the string end with '...'?
 * @returns Formatted string
 */
export function cutTo(input = 'error', from = 0, to = 250, ending = true) {
	if (input.length > to) {
		// check if the last character before the ... is a space and remove it
		if (input.charAt(to - 1) === ' ') {
			return input.substring(from, to - 1) + (ending ? '...' : '');
		}
		return input.substring(from, to) + (ending ? '...' : '');
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
	const wrap = input.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');

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

/**
 * Sends a random loading message, which are defined in `#lib/constants`.
 * @param Message The message to send the random response with.
 */
export async function sendLoadingMessage(interaction) {
	const randomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];

	return interaction.reply({
		embeds: [new EmbedBuilder().setDescription(pickRandom(randomLoadingMessage)).setColor(container.color.GREYPLE)],
		ephemeral: true,
		fetchReply: false
	});
}

/**
 * Checks whether a user should be rate limited.
 * @param param0 The parameters for this function
 * @returns `true` if the user should be rate limited, `false` otherwise
 */
export async function isRateLimited({ time, request, response, manager, auth = false }) {
	if (isNullishOrZero(time) || isNullish(request) || isNullish(response) || isNullish(manager)) {
		return false;
	}
	const id = auth ? request.auth.id : request.headers['x-api-key'] || request.socket.remoteAddress;
	const bucket = manager.acquire(id);
	response.setHeader('Date', new Date().toUTCString());
	response.setHeader('X-RateLimit-Limit', time);
	response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
	response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());
	if (bucket.limited) {
		response.setHeader('Retry-After', bucket.remainingTime.toString());
		return true;
	}
	try {
		bucket.consume();
	} catch {}
	return false;
}

/**
 * @param {*} ctx The context to use
 * @param {number} x The x position
 * @param {number} y The y position
 * @param {number} width The width of the image
 * @param {number} height The height of the image
 * @returns Greyscale image
 */
export async function greyscale(ctx, x, y, width, height) {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < data.data.length; i += 4) {
		const brightness = 0.24 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
		data.data[i] = brightness;
		data.data[i + 1] = brightness;
		data.data[i + 2] = brightness;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

/**
 *
 * @param {*} ctx The context to use
 * @param {number} x The x position
 * @param {number} y The y position
 * @param {number} width The width of the image
 * @param {number} height The height of the image
 * @param {number} multiplier The multiplier to use
 * @returns Modified Context
 */
export async function contrast(ctx, x, y, width, height, multiplier = 10) {
	const data = ctx.getImageData(x, y, width, height);
	const factor = (multiplier * 10) / 100;
	const intercept = 128 * (1 - factor);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = data.data[i] * factor + intercept;
		data.data[i + 1] = data.data[i + 1] * factor + intercept;
		data.data[i + 2] = data.data[i + 2] * factor + intercept;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function updateIdHints() {
	let hints = getIdHints();

	let errCnt = 0;
	let sucCnt = 0;

	hints.forEach(([cmd, id]) => {
		let regex = new RegExp(`idHints: .+`);
		let replacement = `idHints: '${id}'`;

		try {
			let file = glob.sync(`./src/commands/*/${cmd}.js`)[0];
			let fileContent = fs.readFileSync(file, 'utf8');

			let newContent = fileContent.replace(regex, replacement);

			fs.writeFileSync(file, newContent, 'utf8');

			console.log(`Updated ${file}: ${regex} -> ${replacement}`);
			sucCnt++;
		} catch (error) {
			console.error(`Error updating ${cmd}\n${error}`);
			errCnt++;
		}
	});

	console.log(`Updated ${sucCnt} commands, ${errCnt} errors`);
}
