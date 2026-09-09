import { db as database } from '#lib/database';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock, isThenable } from '@sapphire/utilities';
import * as discord from 'discord.js';
import { parse } from 'dotenv';
import type { Message } from 'discord.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inspect } from 'node:util';

const ENV_FILES = ['.env', '.env.dev', '.env.prod', '.env.example'] as const;

const CODE_BLOCK = /^```(?:\w+\n)?([\s\S]*?)\n?```$|^`([^`]+)`$/;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as FunctionConstructor;

@ApplyOptions<Command.Options>({
	aliases: ['e', 'ev'],
	description: 'Evaluates code.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: ['OwnerOnly'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth'],
	quotes: []
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message, args: Args) {
		const parsed = await args.restResult('string');
		if (parsed.isErr()) return send(msg, 'You have to give me something to evaluate.');

		const code = this.stripCodeBlock(parsed.unwrap());
		if (!code.length) return send(msg, 'You have to give me something to evaluate.');

		const depth = Number(args.getOption('depth')) || 0;
		const showHidden = args.getFlags('hidden', 'showHidden');

		const { success, time, result } = await this.eval(code, msg, depth, showHidden);
		if (args.getFlags('silent', 's')) return null;

		const redacted = this.redact(result);

		const fenced = redacted.replaceAll('```', '`\u200b``');
		const output = success ? codeBlock('js', fenced) : `**ERROR**: ${codeBlock('bash', fenced)}`;
		const content = `${output}\n${time}`;

		// send output as file if too long
		if (content.length > 2000) {
			return send(msg, {
				content: `Output was too long... sent the result as a file.\n\n${time}`,
				files: [{ attachment: Buffer.from(redacted), name: 'output.ts' }]
			});
		}

		return send(msg, content);
	}

	private async eval(code: string, _context: Message, depth: number = 0, showHidden: boolean = false) {
		let success = true;
		let syncTime = '';
		let asyncTime = '';
		let result: any = null;
		let thenable = false;

		// Aliases
		const msg = _context;
		const message = _context;
		const db = database;
		const container = this.container;
		const { client, logger } = container;
		const { guild, channel, author, member } = _context;
		void [msg, message, db, discord, client, container, logger, guild, channel, author, member];

		const stopwatch = new Stopwatch();
		try {
			// eslint-disable-next-line no-eval
			result = eval(this.wrap(code));
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
			result = error instanceof Error ? (error.stack ?? error.toString()) : String(error);
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

	// wrap in async
	private wrap(code: string): string {
		try {
			new AsyncFunction(`return (${code});`);
			return `(async () => (${code}))()`;
		} catch {
			return `(async () => {\n${code}\n})()`;
		}
	}

	private stripCodeBlock(code: string): string {
		const trimmed = code.trim();
		const match = CODE_BLOCK.exec(trimmed);
		if (!match) return trimmed;

		if (match[2]?.includes('${')) return trimmed;
		return (match[1] ?? match[2]).trim();
	}

	private redact(content: string): string {
		for (const secret of this.envSecrets()) content = content.replaceAll(secret, '[REDACTED]');
		return content;
	}

	private envSecrets(): string[] {
		const keys = new Set<string>();

		for (const file of ENV_FILES) {
			try {
				for (const key of Object.keys(parse(readFileSync(resolve(process.cwd(), file), 'utf8')))) keys.add(key);
			} catch {}
		}

		return [...keys]
			.map((key) => process.env[key])
			.filter((value): value is string => typeof value === 'string' && value.length >= 3)
			.sort((a, b) => b.length - a.length);
	}

	private formatTime(syncTime: string, asyncTime: string): string {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
