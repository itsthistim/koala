import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { resolveColor } from 'discord.js';

export class RoleCommand extends Subcommand {
	constructor(context, options) {
		super(context, {
			name: 'role',
			aliases: [],
			requiredUserPermissions: [],
			requiredClientPermissions: [],
			preconditions: ['adminOnly'],
			flags: [],
			options: [],
			nsfw: false,
			description: 'Create and modify roles.',
			detailedDescription:
				'`create [name] [color] [hoist] [mentionable]` - Create a role.\n`delete [role]` - Delete a role.\n`edit [role] [name] [color] [hoist] [mentionable]` - Edit a role.\n`info [role]` - Get info about a role.',
			usage: '',
			examples: [''],
			subcommands: [
				{
					name: 'missingArgs',
					messageRun: 'msgMissingArgs',
					default: true
				},
				{
					name: 'create',
					chatInputRun: 'slashCreate',
					messageRun: 'msgCreate'
				},
				{
					name: 'delete',
					chatInputRun: 'slashDelete',
					messageRun: 'msgDelete'
				},
				{
					name: 'edit',
					chatInputRun: 'slashEdit',
					messageRun: 'msgEdit'
				},
				{
					name: 'assign',
					chatInputRun: 'slashAssign',
					messageRun: 'msgAssign'
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((command) =>
					command
						.setName('create')
						.setDescription('Create a role.')
						.addStringOption((option) => option.setName('name').setDescription('The name of the role.').setRequired(true))
						.addStringOption((option) => option.setName('color').setDescription('The color of the role.').setRequired(false))
						.addBooleanOption((option) => option.setName('hoist').setDescription('Whether or not to hoist the role.').setRequired(false))
						.addBooleanOption((option) => option.setName('mentionable').setDescription('Whether or not to make the role mentionable.').setRequired(false))
				)
				.addSubcommand((command) =>
					command
						.setName('edit')
						.setDescription('Edit a role.')
						.addRoleOption((option) => option.setName('role').setDescription('The role to edit.').setRequired(true))
						.addStringOption((option) => option.setName('name').setDescription('The name of the role.').setRequired(false))
						.addStringOption((option) => option.setName('color').setDescription('The color of the role.').setRequired(false))
						.addBooleanOption((option) => option.setName('hoist').setDescription('Whether or not to hoist the role.').setRequired(false))
						.addBooleanOption((option) => option.setName('mentionable').setDescription('Whether or not to make the role mentionable.').setRequired(false))
				)
				.addSubcommand((command) =>
					command
						.setName('delete')
						.setDescription('Delete a role.')
						.addRoleOption((option) => option.setName('role').setDescription('The role to delete.').setRequired(true))
				)
				.addSubcommand((command) =>
					command
						.setName('assign')
						.setDescription('Assign a role to users, bots or everyone.')
						.addRoleOption((option) => option.setName('role').setDescription('The role to assign.').setRequired(true))
						.addUserOption((option) => option.setName('user').setDescription('The user to assign the role to.').setRequired(false))
						.addBooleanOption((option) => option.setName('bots').setDescription('Whether or not to assign the role to all bots.').setRequired(false))
						.addBooleanOption((option) => option.setName('everyone').setDescription('Whether or not to assign the role to everyone.').setRequired(false))
				);
		});
	}

	//#region Missing Args
	async msgMissingArgs(message, args) {
		return reply(message, 'You need to specify a subcommand!\nValid subcommands: `create`, `delete`, `edit`, `assign`.');
	}
	//#endregion

	//#region Create
	async slashCreate(interaction) {
		const name = interaction.options.getString('name');
		let color = interaction.options.getString('color');
		const hoist = interaction.options.getBoolean('hoist');
		const mentionable = interaction.options.getBoolean('mentionable');

		color = this.validateColor(color);
		if (color) color = resolveColor(color);

		console.log(name, color, hoist, mentionable);

		const role = await interaction.guild.roles.create({
			data: {
				name: name,
				color: color,
				hoist: hoist,
				mentionable: mentionable
			}
		});

		const embed = new EmbedBuilder().setTitle('Role Created').setDescription(`Role ${role} created.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();

		await interaction.reply({ embeds: [embed] });
	}

	async msgCreate(message, args) {
		const name = await args.pick('string');
		let color = await args.pick('string').catch(() => null);
		const hoist = await args.pick('boolean').catch(() => false);
		const mentionable = await args.pick('boolean').catch(() => false);

		console.log('validating color', color, '...');
		color = this.validateColor(color);
		console.log('validated color', color);
		console.log('resolving color ...');
		if (color) color = resolveColor(color);
		console.log('resolved color', color);

		const role = await message.guild.roles.create({
			name: name,
			color: color,
			hoist: hoist,
			mentionable: mentionable,
			reason: `Role created by ${message.author.tag}`
		});

		const embed = new EmbedBuilder().setTitle('Role Created').setDescription(`Role ${role} created.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();

		await reply(message, { embeds: [embed] });
	}
	//#endregion

	//#region Delete
	async slashDelete(interaction) {
		const role = interaction.options.getRole('role');

		if (!role) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be found.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await interaction.reply({ embeds: [embed] });
			return;
		} else if (!interaction.guild.roles.cache.get(role.id)) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be found.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await interaction.reply({ embeds: [embed] });
			return;
		} else if (role.managed) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be deleted.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await interaction.reply({ embeds: [embed] });
			return;
		}

		await role.delete();

		const embed = new EmbedBuilder().setTitle('Role Deleted').setDescription(`Role ${role} deleted.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}

	async msgDelete(message, args) {
		const role = await args.pick('role').catch(() => null);

		// check if role exists
		if (!role) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be found.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await reply(message, { embeds: [embed] });
			return;
		} else if (!message.guild.roles.cache.get(role.id)) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be found.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await reply(message, { embeds: [embed] });
			return;
		} else if (role.managed) {
			const embed = new EmbedBuilder().setTitle('Role Not Found').setDescription(`Role could not be deleted.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
			await reply(message, { embeds: [embed] });
			return;
		}

		await role.delete();

		const embed = new EmbedBuilder().setTitle('Role Deleted').setDescription(`Role ${role} deleted.`).setColor(this.container.color.CHERRY_RED).setTimestamp();
		await reply(message, { embeds: [embed] });
	}
	//#endregion

	//#region Edit
	async slashEdit(interaction) {
		const role = interaction.options.getRole('role');
		const name = interaction.options.getString('name');
		let color = interaction.options.getString('color');
		const hoist = interaction.options.getBoolean('hoist');
		const mentionable = interaction.options.getBoolean('mentionable');

		color = this.validateColor(color);
		if (color) color = resolveColor(color);

		await role.edit({
			name: name,
			color: color,
			hoist: hoist,
			mentionable: mentionable
		});

		const embed = new EmbedBuilder().setTitle('Role Edited').setDescription(`Role ${role} edited.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}

	async msgEdit(message, args) {
		const role = await args.pick('role');
		const name = await args.pick('string').catch(() => null);
		let color = await args.pick('string').catch(() => null);
		const hoist = await args.pick('boolean').catch(() => false);
		const mentionable = await args.pick('boolean').catch(() => false);

		color = this.validateColor(color);
		if (color) color = resolveColor(color);

		await role.edit({
			name: name,
			color: color,
			hoist: hoist,
			mentionable: mentionable
		});

		const embed = new EmbedBuilder().setTitle('Role Edited').setDescription(`Role ${role} edited.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();
		await reply(message, { embeds: [embed] });
	}

	validateColor(color) {
		let validColor = /^(#?([0-9a-f]{3}){1,2})$/i; // |\bgreen|\bwhite|\baqua|\bgreen|\bblue|\byellow|\bpurple|\bluminousvividpink|\bfuchsia|\bgold|\borange|\bred|\bgrey|\bnavy|\bdarkaqua|\bdarkgreen|\bdarkblue|\bdarkpurple|\bdarkvividpink|\bdarkgold|\bdarkorange|\bdarkred|\bdarkgrey|\bdarkergrey|\blightgrey|\bdarknavy|\bblurple|\bgreyple|\bdarkbutnotblack|\bnotquiteblack|\brandom

		if (!validColor.test(color)) {
			color = null;
		}

		return color;
	}
	//#endregion

	//#region Assign
	async slashAssign(interaction) {
		const role = interaction.options.getRole('role');
		const user = interaction.options.getUser('user');
		const bots = interaction.options.getBoolean('bots');
		const everyone = interaction.options.getBoolean('everyone');

		if (user) {
			await user.roles.add(role);
		} else if (bots) {
			await interaction.guild.members.cache.filter((member) => member.user.bot).forEach((member) => member.roles.add(role));
		} else if (everyone) {
			await interaction.guild.members.cache.forEach((member) => member.roles.add(role));
		}

		const embed = new EmbedBuilder().setTitle('Role Assigned').setDescription(`Role ${role} assigned.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}

	async msgAssign(message, args) {
		const role = await args.pick('role');
		const target = await args.pick('user').catch(() => args.pick('string').catch(() => null));

		if (typeof target === 'string') {
			switch (target) {
				case 'bots':
					await message.guild.members.cache.filter((member) => member.user.bot).forEach((member) => member.roles.add(role));
					break;
				case 'everyone':
					await message.guild.members.cache.forEach((member) => member.roles.add(role));
					break;
				default:
					break;
			}
		} else if (target?.id) {
			await target.roles.add(role);
		}

		const embed = new EmbedBuilder().setTitle('Role Assigned').setDescription(`Role ${role} assigned.`).setColor(this.container.color.PASTEL_GREEN).setTimestamp();
		await reply(message, { embeds: [embed] });
	}
}
