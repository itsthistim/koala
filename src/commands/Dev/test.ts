import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { db } from '../../lib/database';

@ApplyOptions<Command.Options>({
	description: 'Tests',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message) {
		console.log('Testing database connection...');

		try {
			const result = await db.query('SELECT NOW()');
			return msg.reply(`Database connection successful! Time: ${result.rows[0].now}`);
		} catch (error) {
			this.container.logger.error(error);
			return msg.reply(`Database connection failed: ${error}`);
		}
	}
}
