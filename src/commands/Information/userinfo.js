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
					.setName(process.env == 'PRODUCTION' ? this.name : this.name + '-dev')
					.setDescription(this.description)
					.addUserOption((option) => option.setName('user').setDescription('The user or the id of the user to get information about.'));
			},
			{
				guildIds: ['502208815937224715', '628122911449808896'],
				idHints: '1072627687413256203'
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

		let member = interaction.guild.members.cache.get(user.id);

		if (!member) {
			return new EmbedBuilder()
				.setColor(COLORS.DEFAULT)
				.setAuthor({
					name: `${user.username}`,
					iconURL: user.displayAvatarURL({ dynamic: true })
				})
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setDescription(`${user}`)
				.addFields({
					name: 'Joined Discord',
					value: `${moment.utc(user.createdAt).format('MMM Do YYYY, HH:mm:ss')}\n(${this.durationAgo(user.createdAt)})`,
					inline: true
				})
				.setFooter({ text: `All times are UTC!` });
		}

		let embed = new EmbedBuilder()
			.setColor(COLORS.DEFAULT)
			.setAuthor({
				name: `${member.user.tag}`,
				iconURL: user.displayAvatarURL({ dynamic: true })
			})
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member.presence ? status[member.presence.status] : ''}${member}`)
			.addFields(
				{
					name: 'Joined Server',
					value: `${moment.utc(member.joinedAt).format('MMM Do YYYY, HH:mm:ss')}\n(${this.durationAgo(member.joinedAt)})`,
					inline: true
				},
				{
					name: 'Joined Discord',
					value: `${moment.utc(member.user.createdAt).format('MMM Do YYYY, HH:mm:ss')}\n(${this.durationAgo(member.user.createdAt)})`,
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

		embed.setFooter({ text: `All times are UTC!` });

		return embed;
	}

	durationAgo(date) {

		date = moment.utc(date).valueOf();

		// If the duration is less than an hour, return the minutes and seconds
		if (Date.now() - date < 3600000) {
			return moment.duration(Date.now() - date).format('m [minutes and] s [seconds ago]');
		}

		// If the duration is less than a day, return the hours and minutes
		if (Date.now() - date < 86400000) {
			return moment.duration(Date.now() - date).format('H [hours and] m [minutes ago]');
		}

		// If the duration is less than a week, return the days and hours
		if (Date.now() - date < 604800000) {
			return moment.duration(Date.now() - date).format('D [days and] H [hours ago]');
		}

		// If the duration is less than a month, return the weeks and days
		if (Date.now() - date < 2592000000) {
			return moment.duration(Date.now() - date).format('w [weeks] and d [days ago]');
		}

		// If the duration is less than a year, return the months and weeks
		if (Date.now() - date < 31536000000) {
			return moment.duration(Date.now() - date).format('M [months and] w [weeks ago]');
		}

		// If the duration is any longer, return the years and months
		return moment.duration(Date.now() - date).format('y [years and] M [months ago]');
	}

	isMember(interaction, user) {
		return interaction.guild.members.cache.has(user.id);
	}
}
