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
		const amountResult = await args.pickResult('integer');
		const amount = amountResult.isOk() ? amountResult.unwrap() : 1;

		const result = await db.query(`
			INSERT INTO "dagi_count" (id, count)
			VALUES (1, $1)
			ON CONFLICT (id)
			DO UPDATE SET count = "dagi_count".count + $1
			RETURNING count;
		`, [amount]);

		const newCount = result.rows[0].count;
		return reply(msg, `Dagi counter: **${newCount}**`);
	}
}
