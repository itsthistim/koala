const Discord = require('discord.js');
const { Command } = require('discord-akairo');

module.exports = class extends Command {

	constructor() {
		super('mute', {
			aliases: ['mute'],
			description: {
				content: 'Mutes a user in the server.',
				usage: '[user] <reason>',
                ownerOnly: true,
				examples: [
					'mute @Auric#5650 for spamming chat',
					'mute auric for being toxic',
					'mute 451387167747473420 not abiding the rules'
				]
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message) => `${message.author}, provide a member to mute.`,
						retry: (message) => `${message.author}, provide a **valid** member to mute.`
					}
				},
				{
					id: 'reason',
					type: 'string',
					match: 'rest',
					default: 'No reason provided.'
				}
			],
			userPermissions: ['MANAGE_ROLES'],
			clientPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS']
		});
	}

	async exec(message, { member, reason }) {
		if (message.author.id === member.id) return message.util.send(`❌ You can not mute yourself.`);
		if (this.client.user.id === member.id) return message.util.send(`❌ You can not mute me.`);
		if (member.id === message.guild.owner.id) return message.util.send(`❌ You can not mute the server owner.`);
		if (member.hasPermission('ADMINISTRATOR')) return message.util.send(`❌ ${member.user.tag} has \`Administrator\` and cannot be **muted**.`);

		const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
		const bot = message.guild.members.cache.get(this.client.user.id).roles.highest;

        if (!muteRole) {
			await message.guild.roles.create({
				data: {
					name: 'Muted',
					color: '#bdbdbd',
					hoist: false,
					position: 0,
					permissions: [],
					mentionable: false
				},
				reason: 'No role for mutes found, hence this was created.'
			}).catch(console.error);
		}

		if (muteRole && member.roles.cache.has(muteRole.id)) {
			return message.util.send({
				embed: {
					color: "RED",
					description: `❌ That user is already muted.`
				}
			});
		}
		if (muteRole.position > bot.position) {
			return message.util.send(`❌ The **mute role** is higher than my role, I'm unable to mute.`);
		}
		if (member.roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.util.send(`❌ The user's role is higher than my role, I'm unable to add the \`Muted\` role.`);
		}

		member.roles.add(muteRole, reason).then(mutedMember => {
			message.util.send(`${this.client.emoji.moderation} ${mutedMember.user.tag} has been **muted**.`);
		});

		// stage test 2

		try {
			message.guild.channels.cache.forEach((channel) => {
				channel.updateOverwrite(muteRole.id, {
					SEND_MESSAGES: false,
					CONNECT: false,
					ADD_REACTIONS: false
				});
			});
		} catch (error) {
			message.util.send(`❌ The muted role was **given** to the user, but I wasn't able to **configure** the muted role for **all channels** make sure I have the **Manage Channels** permission on every channel.`);
		}

		if (message.guild.logs === null) return;

		const kickEmbed = new Discord.MessageEmbed()
			.setColor("YELLOW")
			.setAuthor('Mute')
			.addField('User', `${member.user.tag}(${member})`, true)
			.addField('Moderator', `${message.author.tag || 'No moderator was found'}`, true)
			.addField('Reason', `${reason}`)
			.setTimestamp();

		const logsChannel = message.channel;
		logsChannel.send(kickEmbed);
	}

};
