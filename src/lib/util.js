import { createCanvas } from 'canvas';

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
}

export class StringUtil {
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
	 * Shortens a text.
	 * @param {string} input Input string
	 * @param {number} from Start index
	 * @param {number} to End index
	 * @param {boolean} ending Should the string end with '...'?
	 * @returns Formatted string
	 */
	static fitTo(input, maxLength = 250, ending = false) {
		if (input.length >= maxLength) {
			input = input.trim();
			return input.substring(0, maxLength - (ending ? 3 : 0)) + (ending ? '...' : '');
		}
		return input;
	}

	/**
	 * Wraps a string to fit into a certain length.
	 * @param {string} input String to be wrapped
	 * @param {number} length Length of each line
	 * @returns Wrapped string
	 */
	static async softWrap(input, length = 30) {
		const wrap = input.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');
		return wrap;
	}

	/**
	 * Capitalizes a given string.
	 * @param {string} toCapitalize String to capitalize.
	 * @return {string} capitalized string
	 */
	static async capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	/**
	 * Picks a random element from an array and returns it.
	 * @param {Array} array Array to pick from.
	 * @return a random item
	 */
	static async pickRandom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
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

export class CanvasUtil {
	static greyscale(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			const brightness = 0.34 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
			data.data[i] = brightness;
			data.data[i + 1] = brightness;
			data.data[i + 2] = brightness;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static invert(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = 255 - data.data[i];
			data.data[i + 1] = 255 - data.data[i + 1];
			data.data[i + 2] = 255 - data.data[i + 2];
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static silhouette(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = 0;
			data.data[i + 1] = 0;
			data.data[i + 2] = 0;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static sepia(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < data.data.length; i += 4) {
			const brightness = 0.34 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
			data.data[i] = brightness + 100;
			data.data[i + 1] = brightness + 50;
			data.data[i + 2] = brightness;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static contrast(ctx, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		const factor = 259 / 100 + 1;
		const intercept = 128 * (1 - factor);
		for (let i = 0; i < data.data.length; i += 4) {
			data.data[i] = data.data[i] * factor + intercept;
			data.data[i + 1] = data.data[i + 1] * factor + intercept;
			data.data[i + 2] = data.data[i + 2] * factor + intercept;
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static desaturate(ctx, level, x, y, width, height) {
		const data = ctx.getImageData(x, y, width, height);
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				const dest = (i * width + j) * 4;
				const grey = Number.parseInt(0.2125 * data.data[dest] + 0.7154 * data.data[dest + 1] + 0.0721 * data.data[dest + 2], 10);
				data.data[dest] += level * (grey - data.data[dest]);
				data.data[dest + 1] += level * (grey - data.data[dest + 1]);
				data.data[dest + 2] += level * (grey - data.data[dest + 2]);
			}
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static distort(ctx, amplitude, x, y, width, height, strideLevel = 4) {
		const data = ctx.getImageData(x, y, width, height);
		const temp = ctx.getImageData(x, y, width, height);
		const stride = width * strideLevel;
		for (let i = 0; i < width; i++) {
			for (let j = 0; j < height; j++) {
				const xs = Math.round(amplitude * Math.sin(2 * Math.PI * 3 * (j / height)));
				const ys = Math.round(amplitude * Math.cos(2 * Math.PI * 3 * (i / width)));
				const dest = j * stride + i * strideLevel;
				const src = (j + ys) * stride + (i + xs) * strideLevel;
				data.data[dest] = temp.data[src];
				data.data[dest + 1] = temp.data[src + 1];
				data.data[dest + 2] = temp.data[src + 2];
			}
		}
		ctx.putImageData(data, x, y);
		return ctx;
	}

	static fishEye(ctx, level, x, y, width, height) {
		const frame = ctx.getImageData(x, y, width, height);
		const source = new Uint8Array(frame.data);
		for (let i = 0; i < frame.data.length; i += 4) {
			const sx = (i / 4) % frame.width;
			const sy = Math.floor(i / 4 / frame.width);
			const dx = Math.floor(frame.width / 2) - sx;
			const dy = Math.floor(frame.height / 2) - sy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const x2 = Math.round(frame.width / 2 - dx * Math.sin(dist / (level * Math.PI) / 2));
			const y2 = Math.round(frame.height / 2 - dy * Math.sin(dist / (level * Math.PI) / 2));
			const i2 = (y2 * frame.width + x2) * 4;
			frame.data[i] = source[i2];
			frame.data[i + 1] = source[i2 + 1];
			frame.data[i + 2] = source[i2 + 2];
			frame.data[i + 3] = source[i2 + 3];
		}
		ctx.putImageData(frame, x, y);
		return ctx;
	}

	static pixelize(ctx, canvas, image, level, x, y, width, height) {
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(image, x, y, width * level, height * level);
		ctx.drawImage(canvas, x, y, width * level, height * level, x, y, width, height);
		ctx.imageSmoothingEnabled = true;
		return ctx;
	}

	static hasAlpha(image) {
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let hasAlphaPixels = false;
		for (let i = 3; i < data.data.length; i += 4) {
			if (data.data[i] < 255) {
				hasAlphaPixels = true;
				break;
			}
		}
		return hasAlphaPixels;
	}

	static drawImageWithTint(ctx, image, color, x, y, width, height) {
		const { fillStyle, globalAlpha } = ctx;
		ctx.fillStyle = color;
		ctx.drawImage(image, x, y, width, height);
		ctx.globalAlpha = 0.5;
		ctx.fillRect(x, y, width, height);
		ctx.fillStyle = fillStyle;
		ctx.globalAlpha = globalAlpha;
	}

	static shortenText(ctx, text, maxWidth) {
		let shorten = false;
		while (ctx.measureText(`${text}...`).width > maxWidth) {
			if (!shorten) shorten = true;
			text = text.substr(0, text.length - 1);
		}
		return shorten ? `${text}...` : text;
	}

	static wrapText(ctx, text, maxWidth) {
		return new Promise((resolve) => {
			if (ctx.measureText(text).width < maxWidth) return resolve([text]);
			if (ctx.measureText('W').width > maxWidth) return resolve(null);
			const words = text.split(' ');
			const lines = [];
			let line = '';
			while (words.length > 0) {
				let split = false;
				while (ctx.measureText(words[0]).width >= maxWidth) {
					const temp = words[0];
					words[0] = temp.slice(0, -1);
					if (split) {
						words[1] = `${temp.slice(-1)}${words[1]}`;
					} else {
						split = true;
						words.splice(1, 0, temp.slice(-1));
					}
				}
				if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
					line += `${words.shift()} `;
				} else {
					lines.push(line.trim());
					line = '';
				}
				if (words.length === 0) lines.push(line.trim());
			}
			return resolve(lines);
		});
	}

	static centerImage(base, data) {
		const dataRatio = data.width / data.height;
		const baseRatio = base.width / base.height;
		let { width, height } = data;
		let x = 0;
		let y = 0;
		if (baseRatio < dataRatio) {
			height = data.height;
			width = base.width * (height / base.height);
			x = (data.width - width) / 2;
			y = 0;
		} else if (baseRatio > dataRatio) {
			width = data.width;
			height = base.height * (width / base.width);
			x = 0;
			y = (data.height - height) / 2;
		}
		return { x, y, width, height };
	}

	static centerImagePart(data, maxWidth, maxHeight, widthOffset, heightOffest) {
		let { width, height } = data;
		if (width > maxWidth) {
			const ratio = maxWidth / width;
			width = maxWidth;
			height *= ratio;
		}
		if (height > maxHeight) {
			const ratio = maxHeight / height;
			height = maxHeight;
			width *= ratio;
		}
		const x = widthOffset + (maxWidth / 2 - width / 2);
		const y = heightOffest + (maxHeight / 2 - height / 2);
		return { x, y, width, height };
	}

	static generateErrorImage(error) {
		const canvas = createCanvas(512, 512);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#20C20E';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.font = '20px Consolas';
		ctx.fillText('Error', 64, 64);
		ctx.font = '16px Consolas';
		ctx.fillText(error, 64, 80);
		return {
			attachment: canvas.toBuffer(),
			name: 'error.png'
		};
	}
}
