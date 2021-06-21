//#region database
require('dotenv').config();
const mysql2 = require("mysql2/promise");

global.DB = require('./src/util/queryDatabase.js')

//#endregion
//#region Discord & Akairo
const Discord = require('discord.js');
const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, Flag } = require('discord-akairo');
const Logger = require('./src/util/logger.js');

//#endregion
//#region Paths
const { join } = require('path');
const commandsPath = join('./src/commands/');
const listenersPath = join('./src/listeners/');
const inhibitorsPath = join('./src/inhibitors/');
//#endregion

global.gcolors = ['#9aacb6', '#43B581', '#F04747'];

class Client extends AkairoClient {
	constructor() {
		super({
			ownerID: ['319183644331606016', ''],
		}, {
			storeMessages: true,
			disableMentions: 'everyone',
		});

		let promptMsg;
		let msgFilter = [];

		this.commandHandler = new CommandHandler(this, {
			directory: commandsPath,
			prefix: ['k!', 'r!', 'c!'],
			allowMention: true,
			aliasReplacement: /-/g,
			automateCategories: false,
			blockBots: true,
			blockClient: true,
			typing: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 600000,
			storeMessages: true,
			defaultCooldown: 1000,
			ignoreCooldown: ['319183644331606016', 'y'],
			argumentDefaults: {
				prompt: {
					retries: 5,
					time: 30000,
					cancelWord: 'cancel',
					stopWord: 'stop',
					modifyStart: async (message, text) => {
						const embed = new Discord.MessageEmbed()
							.setColor(global.gcolors[0])
							.setDescription('❌ ' + text);
						message.util.send(embed);
					},
					modifyRetry: async (message, text, { message: pmsg }) => {
						if (text) {
							const embed = new Discord.MessageEmbed()
								.setColor(global.gcolors[0])
								.setDescription('❌ ' + text);
							message.util.send(embed);
						}
					},
					ended: async (message, { message: pmsg }) => {
						const embed = new Discord.MessageEmbed()
							.setColor(global.gcolors[0])
							.setDescription('❗ Too many retries! Cancelled command.');
						message.channel.send(embed);
						pmsg.delete();
					},
					cancel: async (message, { message: pmsg }) => {
						const embed = new Discord.MessageEmbed()
							.setColor(global.gcolors[0])
							.setDescription('❌ Command has been cancelled!');
						message.util.send(embed);
						pmsg.delete();
					},
					timeout: async (message) => {
						const embed = new Discord.MessageEmbed()
							.setColor(global.gcolors[0])
							.setDescription('⏱ Time ran out, command has been cancelled!');
						message.util.send(embed);
					}
				}
			}
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: inhibitorsPath
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: listenersPath
		});

		this.logger = Logger;

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);

		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler
		});

	//#region Custom Types

		this.commandHandler.resolver.addType('color', async (message, phrase) => {
			if (!phrase) return null;
                const color = phrase.startsWith('[') ? phrase.slice(phrase.indexOf('[') + 1).slice(0, phrase.indexOf(']') - 1).split(',').map(e => parseInt(e.trim())) : phrase.toUpperCase().replace(' ', '_');
                return this.client.util.resolveColor(color);
		});

		this.commandHandler.resolver.addType('timespan', async (message, phrase) => {
			if (!phrase) return null;

			var TimeUnits = {
				years: { label: '(?:years?|y)', value: 1000 * 60 * 60 * 24 * 365 },
				months: { label: '(?:months?|mons?|mo)', value: 1000 * 60 * 60 * 24 * 30 },
				weeks: { label: '(?:weeks?|w)', value: 1000 * 60 * 60 * 24 * 7 },
				days: { label: '(?:days?|d)', value: 1000 * 60 * 60 * 24 },
				hours: { label: '(?:hours?|hrs?|hos?|h)', value: 1000 * 60 * 60 },
				minutes: { label: '(?:minutes?|mins?|m)', value: 1000 * 60 },
				seconds: { label: '(?:seconds?|secs?|s)', value: 1000 },
				milliseconds: { label: '(?:milliseconds?|msecs?|mills?|millis?|ms)', value: 1 }
			}

            const regexString = Object.entries(TimeUnits).map(([name, { label }]) => String.raw`(?:(?<${name}>-?(?:\d+)?\.?\d+) *${label})?`).join('\\s*');
            const match = new RegExp(`^${regexString}$`, 'i').exec(phrase);
            if (!match) return null;
            let milliseconds = 0;
            for (const key in match.groups) {
                const value = Number(match.groups[key] || 0);
                milliseconds += value * TimeUnits[key].value;
            }
            return milliseconds;
		});

		this.commandHandler.resolver.addType('amember', async (message, phrase) => {
			if (!phrase) return null;
			let memberArray = [];
			let membersFound = this.util.resolveMembers(phrase, message.guild.members.cache);

			if (membersFound.size == 0) return null;

			membersFound.map(c => memberArray.push(c));

			if (membersFound.size == 1) return memberArray[0];

			if (membersFound.size > 10) return null;

			let ind = 1;
			let membersMap = membersFound.map(c => `**${ind++}.** \`${c.user.tag}\``).join("\n");
			const listEmbed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`Mulitple members found. Please choose one of the following members, or type cancel.\n\n${membersMap}`)

			let userMsgFind = await msgFilter.find(c => c.userID === message.author.id)

			if (!userMsgFind) {
				//Prompt was not fired, send new message
				promptMsg = await message.channel.send(listEmbed)
			} else {
				//Prompt was fired, edit prompt msg
				promptMsg = await message.channel.messages.fetch(userMsgFind.msgID)
				await promptMsg.edit(listEmbed)
			}

			let msgFilterReset = msgFilter.filter(c => c.userID !== message.author.id)
			msgFilter = msgFilterReset

			let filter = m => m.author.id == message.author.id
			let collectedInput;
			let tries = 0;
			let failed = true;
			let outOfTime = false;
			let coll;

			for (tries = 0; tries < 5; tries++) {
				try {
					//Collect Message
					coll = await message.channel.awaitMessages(filter, {
						max: 1,
						time: 5000,
						errors: ["time"]
					})
				} catch (e) {
					//Catch timeout
					const outOfTimeE = new Discord.MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
					.setDescription(`<a:rxm:683827905377206310> You ran out of time, command has been cancelled`)

					outOfTime = await true;
					promptMsg ? promptMsg.edit(outOfTimeE) : message.channel.send(outOfTimeE)
					return Flag.cancel();
				}

				//Time is over
				if (outOfTime == true) return Flag.cancel()

				let m = coll.first()
				if (!isNaN(coll.first().content) && parseInt(m.content) >= 1 && parseInt(m.content) <= membersFound.size) {
					collectedInput = await parseInt(coll.first().content)
					failed = await false
					break
				}

				//Collected Cancel input
				if (m.content.toLowerCase() === "cancel") {
					collectedInput = await coll.first().content
					failed = await false
					break
				}

				//A valid input was not found
				const notValidInput = new Discord.MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL({
						dynamic: true
					}))
					.setDescription(`❌ Your \`Input\` was not valid. Please choose a valid numbers from below, or type cancel.\n\n${membersMap}`)

				promptMsg ? promptMsg.edit(notValidInput) : message.util.send(notValidInput)
			}

			//To many tries, command failed
			if (failed == true) {
				let embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL( {format: 'png', dynamic: true }))
				.setColor("#BA0000")
				.setDescription(`<a:rxm:683827905377206310> Too many retries, command has been cancelled`)
				promptMsg ? promptMsg.edit(embed) : message.util.send(embed)

				return Flag.cancel()
			}

			if (collectedInput === "cancel") {
				let embed = new Discord.MessageEmbed()
					.setAuthor(message.author.tag, message.author.displayAvatarURL( { format: 'png', dynamic: true }))
					.setDescription(` ${w} Command has been cancelled`);
				promptMsg ? promptMsg.edit(embed) : message.channel.send(embed);
				return Flag.cancel();
			}

			return memberArray[collectedInput - 1]
		});

		this.commandHandler.resolver.addType('image', (msg, phrase) => {
			// if no user or no image url its invalid -> null
			if (!phrase) return null;

			// attachments
			const attachment = msg.attachments.first();
			if (attachment) return attachment.url;

			// regex to check if the given string ends in a valid file type
			const fileTypeReg = /\.(jpe?g|png|gif|jfif|bmp)$/i;

			// make <links> work
			phrase = phrase.replace('<', '');
			phrase = phrase.replace('>', '');

			// if regex returns true then return it to the commmand
			if (fileTypeReg.test(phrase.toLowerCase())) return phrase;

			// if its not an url check if its a member. if it is return the members pfp url to the command
			try {
				const memberType = this.commandHandler.resolver.type('member');
				const member = memberType(msg, phrase);
				return member.user.displayAvatarURL({ format: 'png', size: 512 });
			} catch (e) {
				return null;
			}
		});

	//#endregion

		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();
	}
}

const client = new Client({ ws: { intents: ['GUILD_PRESENCES', 'GUILD_MEMBERS'] } });
client.login();