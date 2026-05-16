import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { Duration } from '@sapphire/time-utilities';
import { db } from '#lib/database';

@ApplyOptions<Command.Options>({
	description: 'Automatically delete messages in a channel.',
	requiredUserPermissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels],
	requiredClientPermissions: [PermissionFlagsBits.ManageMessages],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('enable')
				.setDescription('Enable automatic deletion of messages with the current filters.')
				.addChannelOption((option) => option.setName('channel').setDescription('Where to automatically delete messages.').setRequired(false))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('disable')
				.setDescription('Disable automatic deletion of messages.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('Where to disable automatic deletion.').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('View current autodelete configuration for a channel.')
				.addChannelOption((option) =>
					option.setName('channel').setDescription('The channel to inspect.').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('settings')
				.setDescription('Configure settings like wait time before deletion, regex keywords and logging.')
				.addStringOption((option) =>
					option.setName('duration').setDescription('Delete messages after a certain duration (e.g. 10m, 2h). Use "none" to disable.')
				)
				.addBooleanOption((option) => option.setName('bots').setDescription('Delete all messages sent by bots.'))
				.addStringOption((option) => option.setName('filter').setDescription('Keyword or regex to match messages for deletion. Use "none" to disable.'))
				.addChannelOption((option) => option.setName('log_channel').setDescription('Channel to log deletions to.').setRequired(false))
				.addChannelOption((option) =>
					option.setName('channel').setDescription('The channel to configure.').setRequired(false)
				)
		)
		.addSubcommandGroup((group) =>
			group
				.setName('list')
				.setDescription('Manage user and role whitelist / blacklist configurations.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('add')
						.setDescription('Add a filter for specific users or roles to either always delete or always ignore.')
						.addUserOption((option) =>
							option.setName('delete_user').setDescription('User whose messages will always be deleted.').setRequired(false)
						)
						.addUserOption((option) =>
							option.setName('ignore_user').setDescription('User whose messages will NEVER be deleted.').setRequired(false)
						)
						.addRoleOption((option) =>
							option.setName('delete_role').setDescription('Role whose messages will always be deleted.').setRequired(false)
						)
						.addRoleOption((option) =>
							option.setName('ignore_role').setDescription('Role whose messages will NEVER be deleted.').setRequired(false)
						)
						.addChannelOption((option) =>
							option.setName('channel').setDescription('The channel to configure.').setRequired(false)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('Remove a user or role from delete/ignore lists.')
						.addUserOption((option) => option.setName('user').setDescription('User to remove.').setRequired(false))
						.addRoleOption((option) => option.setName('role').setDescription('Role to remove from either list.').setRequired(false))
						.addChannelOption((option) =>
							option.setName('channel').setDescription('The channel to configure.').setRequired(false)
						)
				)
		)
)
export class AutodeleteCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		if (!interaction.guildId) {
			await interaction.editReply('This must be run in a server.');
			return;
		}

		const subcommand = interaction.options.getSubcommand(true);
		const group = interaction.options.getSubcommandGroup(false);
		const channel = interaction.options.getChannel('channel') || interaction.channel;

		if (!channel || !('isDMBased' in channel) || channel.isDMBased()) {
			await interaction.editReply('Invalid channel.');
			return;
		}

		try {
			if (subcommand === 'disable') {
				await this.handleDisable(interaction, channel.id);
				return;
			}

			if (subcommand === 'view') {
				await this.handleView(interaction, channel.id, channel);
				return;
			}

			// Ensure record exists for the rest
			await db.query(
				`
                INSERT INTO channel_filters (guild_id, channel_id) 
                VALUES ($1, $2) ON CONFLICT DO NOTHING`,
				[interaction.guildId, channel.id]
			);

			if (subcommand === 'enable' && !group) {
				await interaction.editReply(
					`Autodelete is now active for <#${channel.id}>. Since no specific options were provided, if this channel has no existing filters, ALL messages will instantly be deleted.`
				);
				return;
			}

			if (subcommand === 'settings' && !group) {
				await this.handleSet(interaction, channel.id);
				return;
			}

			if (group === 'list') {
				if (subcommand === 'add') {
					await this.handleAdd(interaction, channel.id);
				} else if (subcommand === 'remove') {
					await this.handleRemove(interaction, channel.id);
				}
			}
		} catch (err: any) {
			this.container.logger.error(err);
			await interaction.editReply('A database error occurred.');
		}
	}

	private async handleDisable(interaction: Command.ChatInputCommandInteraction, channelId: string) {
		await db.query(`DELETE FROM channel_filters WHERE channel_id = $1`, [channelId]);
		await interaction.editReply(`All autodelete filters disabled and cleared for <#${channelId}>.`);
	}

	private parseDurationArg(durationStr: string): { valid: boolean; value: number | null; error?: string } {
		if (durationStr.toLowerCase() === 'none') {
			return { valid: true, value: null };
		}
		try {
			const parsed = new Duration(durationStr).offset;
			if (!Number.isNaN(parsed) && parsed > 0) {
				return { valid: true, value: Math.floor(parsed / 1000) };
			}
			return { valid: false, value: null, error: 'Invalid duration format (e.g. 10m, 2h). Use "none" to disable.' };
		} catch {
			return { valid: false, value: null, error: 'Invalid duration format.' };
		}
	}

	private async handleSet(interaction: Command.ChatInputCommandInteraction, channelId: string) {
		let updates: string[] = [];
		const values: any[] = [];
		let i = 1;

		const durationStr = interaction.options.getString('duration');
		if (durationStr) {
			const { valid, value, error } = this.parseDurationArg(durationStr);
			if (!valid) {
				await interaction.editReply(error || 'Invalid duration.');
				return;
			}
			updates.push(`max_age_seconds = $${i++}`);
			values.push(value);
		}

		const bots = interaction.options.getBoolean('bots');
		if (bots !== null) {
			updates.push(`delete_bots = $${i++}`);
			values.push(bots);
		}

		const filter = interaction.options.getString('filter');
		if (filter) {
			updates.push(`text_filter = $${i++}`);
			values.push(filter.toLowerCase() === 'none' ? null : filter);
		}

		const logChannel = interaction.options.getChannel('log_channel');
		if (logChannel) {
			updates.push(`log_channel_id = $${i++}`);
			values.push(logChannel.id);
		}

		if (updates.length > 0) {
			values.push(channelId);
			await db.query(`UPDATE channel_filters SET ${updates.join(', ')} WHERE channel_id = $${i}`, values);
			await interaction.editReply(`Settings updated for <#${channelId}>.`);
		} else {
			await interaction.editReply('No settings provided to update.');
		}
	}

	private async handleAdd(interaction: Command.ChatInputCommandInteraction, channelId: string) {
		const deleteUser = interaction.options.getUser('delete_user');
		const ignoreUser = interaction.options.getUser('ignore_user');
		const deleteRole = interaction.options.getRole('delete_role');
		const ignoreRole = interaction.options.getRole('ignore_role');

		if (!deleteUser && !ignoreUser && !deleteRole && !ignoreRole) {
			await interaction.editReply('Must specify a user or role to add.');
			return;
		}

		const res = await db.query(`SELECT delete_users, delete_roles, ignore_users, ignore_roles FROM channel_filters WHERE channel_id = $1`, [
			channelId
		]);
		const row = res.rows[0];
		let dUsers = row?.delete_users || [];
		let iUsers = row?.ignore_users || [];
		let dRoles = row?.delete_roles || [];
		let iRoles = row?.ignore_roles || [];

		if (deleteUser && !dUsers.includes(deleteUser.id)) dUsers.push(deleteUser.id);
		if (ignoreUser && !iUsers.includes(ignoreUser.id)) iUsers.push(ignoreUser.id);
		if (deleteRole && !dRoles.includes(deleteRole.id)) dRoles.push(deleteRole.id);
		if (ignoreRole && !iRoles.includes(ignoreRole.id)) iRoles.push(ignoreRole.id);

		await db.query(
			`UPDATE channel_filters SET delete_users = $1, delete_roles = $2, ignore_users = $3, ignore_roles = $4 WHERE channel_id = $5`,
			[dUsers, dRoles, iUsers, iRoles, channelId]
		);

		await interaction.editReply(`Filter updated for <#${channelId}>.`);
	}

	private async handleRemove(interaction: Command.ChatInputCommandInteraction, channelId: string) {
		const user = interaction.options.getUser('user');
		const role = interaction.options.getRole('role');

		if (!user && !role) {
			await interaction.editReply('Must specify a user or role to remove.');
			return;
		}

		const res = await db.query(`SELECT delete_users, delete_roles, ignore_users, ignore_roles FROM channel_filters WHERE channel_id = $1`, [
			channelId
		]);
		const row = res.rows[0];
		let dUsers = row?.delete_users || [];
		let iUsers = row?.ignore_users || [];
		let dRoles = row?.delete_roles || [];
		let iRoles = row?.ignore_roles || [];

		if (user) {
			dUsers = dUsers.filter((id: string) => id !== user.id);
			iUsers = iUsers.filter((id: string) => id !== user.id);
		}
		if (role) {
			dRoles = dRoles.filter((id: string) => id !== role.id);
			iRoles = iRoles.filter((id: string) => id !== role.id);
		}

		await db.query(
			`UPDATE channel_filters SET delete_users = $1, delete_roles = $2, ignore_users = $3, ignore_roles = $4 WHERE channel_id = $5`,
			[dUsers, dRoles, iUsers, iRoles, channelId]
		);

		await interaction.editReply(`Filter updated for <#${channelId}>.`);
	}

	private createConfigEmbed(row: any, channelName: string): EmbedBuilder {
		const embed = new EmbedBuilder().setTitle(`Autodelete config for #${channelName}`).setColor(0x2f3136);

		const deleteUsers =
			Array.isArray(row.delete_users) && row.delete_users.length > 0 ? row.delete_users.map((u: string) => `<@${u}>`).join(', ') : 'None';
		const ignoreUsers =
			Array.isArray(row.ignore_users) && row.ignore_users.length > 0 ? row.ignore_users.map((u: string) => `<@${u}>`).join(', ') : 'None';
		const deleteRoles =
			Array.isArray(row.delete_roles) && row.delete_roles.length > 0 ? row.delete_roles.map((r: string) => `<@&${r}>`).join(', ') : 'None';
		const ignoreRoles =
			Array.isArray(row.ignore_roles) && row.ignore_roles.length > 0 ? row.ignore_roles.map((r: string) => `<@&${r}>`).join(', ') : 'None';

		embed.addFields([
			{ name: 'Duration', value: row.max_age_seconds ? `${row.max_age_seconds}s` : 'Disabled', inline: true },
			{ name: 'Delete Bots', value: row.delete_bots ? 'Yes' : 'No', inline: true },
			{ name: 'Regex/Keyword Filter', value: row.text_filter ? `\`${row.text_filter}\`` : 'None', inline: true },
			{ name: 'Users to Delete', value: deleteUsers },
			{ name: 'Users to Ignore', value: ignoreUsers },
			{ name: 'Roles to Delete', value: deleteRoles },
			{ name: 'Roles to Ignore', value: ignoreRoles },
			{ name: 'Log Channel', value: row.log_channel_id ? `<#${row.log_channel_id}>` : 'None' }
		]);

		return embed;
	}

	private async handleView(interaction: Command.ChatInputCommandInteraction, channelId: string, channel: any) {
		const res = await db.query(`SELECT * FROM channel_filters WHERE channel_id = $1`, [channelId]);
		const row = res.rows[0];

		if (!row) {
			await interaction.editReply(`No filters are currently active for <#${channelId}>.`);
			return;
		}

		const embed = this.createConfigEmbed(row, channel.name);
		await interaction.editReply({ embeds: [embed] });
	}

	public override async messageRun(message: Message, args: Args) {
		if (!message.guild) return;

		let subcommand = 'view';
		try {
			subcommand = await args.pick('string');
		} catch {}

		if (subcommand === 'disable') {
			await db.query(`DELETE FROM channel_filters WHERE channel_id = $1`, [message.channel.id]);
			await reply(message, `All autodelete filters disabled and cleared for this channel.`);
			return;
		}

		if (subcommand === 'view') {
			const res = await db.query(`SELECT * FROM channel_filters WHERE channel_id = $1`, [message.channel.id]);
			const row = res.rows[0];

			if (!row) {
				await reply(message, `No filters are currently active for this channel.`);
				return;
			}

			const embed = this.createConfigEmbed(row, (message.channel as any).name);
			await reply(message, { embeds: [embed] });
			return;
		}

		await reply(
			message,
			'Please use the slash commands (`/autodelete enable`, `/autodelete settings`, `/autodelete list add`, etc.) to configure modifiers. To view settings, use `!autodelete view`.'
		);
	}
}
