import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { CookieStore } from '@sapphire/plugin-api';
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
				}
			]
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(process.env.NODE_ENV == 'PRODUCTION' ? this.name : this.name + '-dev')
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
					);
			},
			{
				guildIds: ['502208815937224715'],
				idHints: process.env.NODE_ENV == 'PRODUCTION' ? null : null
			}
		);
	}

	//#region Missing Args
	async msgMissingArgs(message, args) {
		return reply(message, 'You need to specify a subcommand!\nValid subcommands: `create`, `delete`, `edit`');
	}
	//#endregion

	//#region Create
	async slashCreate(interaction) {
		const name = interaction.options.getString('name');
		const color = interaction.options.getString('color');
		const hoist = interaction.options.getBoolean('hoist');
		const mentionable = interaction.options.getBoolean('mentionable');

		let validColor =
			/^(#?([0-9a-f]{3}){1,2}|\bgreen|\bwhite|\baqua|\bgreen|\bblue|\byellow|\bpurple|\bluminousvividpink|\bfuchsia|\bgold|\borange|\bred|\bgrey|\bnavy|\bdarkaqua|\bdarkgreen|\bdarkblue|\bdarkpurple|\bdarkvividpink|\bdarkgold|\bdarkorange|\bdarkred|\bdarkgrey|\bdarkergrey|\blightgrey|\bdarknavy|\bblurple|\bgreyple|\bdarkbutnotblack|\bnotquiteblack|\brandom)$/i;

		if (!validColor.test(color)) {
			color = null;
		}

		console.log(name, color, hoist, mentionable);

		const role = await interaction.guild.roles.create({
			data: {
				name: name,
				color: color,
				hoist: hoist,
				mentionable: mentionable
			}
		});

		const embed = new EmbedBuilder().setTitle('Role Created').setDescription(`Role ${role} created.`).setColor('GREEN').setTimestamp();

		await interaction.reply({ embeds: [embed] });
	}

	async msgCreate(message, args) {
		const name = await args.pick('string');
		let color = await args.pick('string').catch(() => null);
		const hoist = await args.pick('boolean').catch(() => false);
		const mentionable = await args.pick('boolean').catch(() => false);

		// let validHex = /^(#?([0-9a-f]{3}){1,2}|\bgreen|\bwhite|\baqua|\bgreen|\bblue|\byellow|\bpurple|\bluminousvividpink|\bfuchsia|\bgold|\borange|\bred|\bgrey|\bnavy|\bdarkaqua|\bdarkgreen|\bdarkblue|\bdarkpurple|\bdarkvividpink|\bdarkgold|\bdarkorange|\bdarkred|\bdarkgrey|\bdarkergrey|\blightgrey|\bdarknavy|\bblurple|\bgreyple|\bdarkbutnotblack|\bnotquiteblack|\brandom)$/i;
		// let validColor = /^(\bgreen|\bwhite|\baqua|\bgreen|\bblue|\byellow|\bpurple|\bluminousvividpink|\bfuchsia|\bgold|\borange|\bred|\bgrey|\bnavy|\bdarkaqua|\bdarkgreen|\bdarkblue|\bdarkpurple|\bdarkvividpink|\bdarkgold|\bdarkorange|\bdarkred|\bdarkgrey|\bdarkergrey|\blightgrey|\bdarknavy|\bblurple|\bgreyple|\bdarkbutnotblack|\bnotquiteblack)$/i;
		// if (color === 'RANDOM') color = Math.floor(Math.random() * (0xffffff + 1));
		// else if (color === 'DEFAULT') color = 0;
		// else if (validHex.test(color)) {
		// 	color = parseInt(color.replace('#', ''), 16);
		// }
		// else if (validColor.test(color)) {
		// 	color = color.toUpperCase();
		// }

		color = resolveColor(color);

		console.log(name, color, hoist, mentionable);

		const role = await message.guild.roles.create({
			name: name,
			color: color,
			hoist: hoist,
			mentionable: mentionable,
			reason: `Role created by ${message.author.tag}`
		});

		const embed = new EmbedBuilder().setTitle('Role Created').setDescription(`Role ${role} created.`).setColor('Green').setTimestamp();

		await reply(message, { embeds: [embed] });
	}
}
