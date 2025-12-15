import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { pool } from '../../lib/database';

@ApplyOptions<Command.Options>({
	description: 'Tests the database connection',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message) {
		try {
			const result = await pool.query('SELECT NOW()');
			return msg.reply(`Database connection successful! Time: ${result.rows[0].now}`);
		} catch (error) {
			return msg.reply(`Database connection failed: ${error}`);
		}
	}
}
