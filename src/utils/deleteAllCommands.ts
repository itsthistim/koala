import { REST, Routes } from 'discord.js';

export default async function deleteAllCommands(token: string, clientId: string, guilds: string[]) {
	console.info('Deleting all commands...');
	const rest = new REST().setToken(token);

	try {
		// for guild-based commands
		console.info(`Deleting commands from ${guilds.length} guild(s)...`);
		await Promise.all(
			guilds.map((guildId) =>
				rest
					.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
					.catch((err) => console.error(`Failed to delete from guild ${guildId}:`, err))
			)
		);
		console.info('Successfully deleted all guild commands.');

		// for global commands
		console.info('Deleting global commands...');
		await rest.put(Routes.applicationCommands(clientId), { body: [] });
		console.info('Successfully deleted all global commands.');
	} catch (error) {
		console.error('Error deleting commands:', error);
	}
}
