import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock, isThenable } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<Command.Options>({
	aliases: ['e', 'ev'],
	description: 'Evaluates code.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth']
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message, args: Args) {
		const code = await args.rest('string');
		const isAsync = args.getFlags('async');
		const depth = Number(args.getOption('depth')) ?? 0;
		const showHidden = args.getFlags('hidden', 'showHidden');

		const { success, time, result } = await this.eval(code, msg, isAsync, depth, showHidden);

		let output = success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`;
		if (args.getFlags('silent', 's')) return null;

		// replace discord token with placeholder
		const token = process.env.DISCORD_TOKEN;
		const tokenRegex = token ? new RegExp(token, 'g') : null;
		output = tokenRegex ? output.replace(tokenRegex, '[REDACTED TOKEN]') : output;

		if (output.length > 2000) {
			return send(msg, {
				content: `Output was too long... sent the result as a file.\n\n${time}`,
				files: [{ attachment: Buffer.from(result), name: 'output.ts' }]
			});
		}

		return send(msg, `${output}\n${time}`);
	}

	private async eval(
		code: string,
		_context: Message | Command.ChatInputCommandInteraction,
		isAsync: boolean,
		depth: number = 0,
		showHidden: boolean = false
	) {
		let success = true;
		let syncTime = '';
		let asyncTime = '';
		let result: any = null;
		let thenable = false;

		// @ts-expect-error value is never read, this is so `msg` is possible as an alias when running eval.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const msg = _context;

		const stopwatch = new Stopwatch();
		try {
			if (isAsync) code = `(async () => {\n${code}\n})()`;

			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();

			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}

			if (typeof result !== 'string') {
				result = result instanceof Error ? result.stack : inspect(result, { depth, showHidden });
			}

			stopwatch.stop();
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			result = error instanceof Error ? error.toString() : String(error);
			success = false;
			stopwatch.stop();
		}

		return {
			success,
			time: this.formatTime(syncTime, asyncTime),
			result,
			thenable
		};
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
