import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import moment from 'moment';

export class UserInfoCommand extends Command {
	constructor(context, options) {
		super(context, {
			name: 'userinfo',
			aliases: ['whois'],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: [],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Shows information about a user.',
			detailedDescription: '',
			usage: '[user]',
			examples: ['@user#1234']
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addUserOption((option) => option.setName('user').setDescription('The user or the id of the user to get information about.'));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1063619917447958561'
			}
		);
	}

	async chatInputRun(interaction) {
		const user = interaction.options.getUser('user') || interaction.user;
		let embed = await this.getInfoEmbed(interaction, user);
		interaction.reply({ embeds: [embed] });
	}

	async messageRun(message, args) {
		const user = await args.pick('user').catch(() => message.author);
		
		let embed = await this.getInfoEmbed(message, user);
		reply(message, { embeds: [embed] });
	}

	async getInfoEmbed(interaction, user) {
		let member = interaction.guild.members.cache.get(user.id);

		if (member) {
			const status = {
				online: '<:online:861986701580697670> ',
				idle: '<:idle:861986831541207042>',
				dnd: '<:dnd:861986768517070938> ',
				streaming: '<:streaming:861986871578722364>',
				offline: '<:offline:861986750952112189> '
			};

			const key_permissions = {
				ADMINISTRATOR: 'Administrator',
				MANAGE_GUILD: 'Manage Server',
				MANAGE_ROLES: 'Manage Roles',
				MANAGE_MESSAGES: 'Manage Messages',
				MANAGE_CHANNELS: 'Manage Channels',
				MANAGE_THREADS: 'Manage Threads',
				MANAGE_WEBHOOKS: 'Manage Webhooks',
				MANAGE_NICKNAMES: 'Manage Nicknames',
				MANAGE_EMOJIS: 'Manage Emojis',
				BAN_MEMBERS: 'Ban Members',
				KICK_MEMBERS: 'Kick Members',
				MENTION_EVERYONE: 'Mention Everyone'
			};

			let embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setAuthor({ name: `${member.user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
				.setThumbnail(member.displayAvatarURL({ dynamic: true }))
				.setDescription(`${member.presence ? status[member.presence.status] : ''}${member}`)
				.addFields(
					{
						name: 'Joined Server',
						value: `${moment(member.joinedAt).format('MMM Do YYYY, hh:mm:ss a')}\n(${moment(member.joinedAt).fromNow()})`,
						inline: true
					},
					{
						name: 'Joined Discord',
						value: `${moment(member.createdAt).format('MMM Do YYYY, hh:mm:ss a')}\n(${moment(member.createdAt).fromNow()})`,
						inline: true
					},
					{
						name: `Roles [${member.roles.cache.size - 1}]`,
						value: member.roles.cache.size > 1 ? member.roles.cache.map((r) => r).join(' ') : 'None',
						inline: false
					}
				);

			if (Object.keys(key_permissions).filter((key) => member.permissions.toArray().includes(key)).length > 0) {
				embed.addFields({
					name: 'Key Permissions',
					value: Object.keys(key_permissions)
						.filter((key) => member.permissions.toArray().includes(key))
						.map((key) => key_permissions[key])
						.join(', '),
					inline: false
				});
			}

			return embed;
		} else {
			return new EmbedBuilder()
				.setColor('#0099ff')
				.setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setDescription(`${user}`)
				.addFields({
					name: 'Joined Discord',
					value: `${moment(user.createdAt).format('MMM Do YYYY, hh:mm:ss a')}\n(${moment(user.createdAt).fromNow()})`,
					inline: true
				});
		}
	}

	isMember(interaction, user) {
		return interaction.guild.members.cache.has(user.id);
	}
}
