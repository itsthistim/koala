import { db } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Dagi counter.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm]
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message, args: Args) {
		const amount = await args.pick('integer').catch(() => 1);

		// add to count
		db.query('UPDATE "dagi_count" SET "count" = "count" + $1 WHERE id = 1', [amount]);

		// get count
		const count = await db.query('SELECT "count" FROM "dagi_count" WHERE id = 1').then((res) => res.rows[0].count);
		return reply(msg, `Dagi count: ${count}`);
	}
}
