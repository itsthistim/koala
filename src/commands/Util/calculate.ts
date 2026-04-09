import { ApplyOptions, RegisterChatInputCommand } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, type Args } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, type Message, type AutocompleteInteraction } from 'discord.js';
import { db } from '#lib/database';
import { mathParser } from '#lib/utils/math';

const integrationTypes: ApplicationIntegrationType[] = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall];
const contexts: InteractionContextType[] = [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel];

@ApplyOptions<Subcommand.Options>({
	aliases: ['calc', 'c', 'math'],
	description: 'Calculate expressions and manage saved formulas.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	subcommands: [
		{ name: 'eval', messageRun: 'calcEvalMsg', chatInputRun: 'calcEvalSlash', default: true },
		{ name: 'save', messageRun: 'calcSaveMsg', chatInputRun: 'calcSaveSlash' },
		{ name: 'use', messageRun: 'calcUseMsg', chatInputRun: 'calcUseSlash' },
		{ name: 'list', messageRun: 'calcListMsg', chatInputRun: 'calcListSlash' },
		{ name: 'remove', messageRun: 'calcRemoveMsg', chatInputRun: 'calcRemoveSlash' },
		{ name: 'help', messageRun: 'calcHelpMsg', chatInputRun: 'calcHelpSlash' }
	]
})
@RegisterChatInputCommand((builder, command) =>
	builder
		.setName(command.name)
		.setDescription(command.description)
		.setContexts(...contexts)
		.setIntegrationTypes(...integrationTypes)
		.addSubcommand((sub) =>
			sub //
				.setName('eval')
				.setDescription('Evaluate a mathematical expression.')
				.addStringOption((opt) =>
					opt //
						.setName('expression')
						.setDescription('The expression to evaluate (e.g., "2 + 2", "sqrt(16)").')
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub //
				.setName('save')
				.setDescription('Save a formula for later use with variables.')
				.addStringOption((opt) =>
					opt //
						.setName('name')
						.setDescription('Name for the formula (e.g., "volume").')
						.setRequired(true)
				)
				.addStringOption((opt) =>
					opt //
						.setName('expression')
						.setDescription('The formula expression (e.g., "length * width * height").')
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub //
				.setName('use')
				.setDescription('Use a saved formula by plugging in variables.')
				.addStringOption((opt) =>
					opt //
						.setName('name')
						.setDescription('Name of the saved formula.')
						.setRequired(true)
						.setAutocomplete(true)

				)
				.addStringOption((opt) =>
					opt //
						.setName('variables')
						.setDescription('Variable values as key:value pairs (e.g., "length:10 width:5 height:3").')
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub //
				.setName('list')
				.setDescription('List all your saved formulas.')
		)
		.addSubcommand((sub) =>
			sub //
				.setName('remove')
				.setDescription('Remove a saved formula.')
				.addStringOption((opt) =>
					opt //
						.setName('name')
						.setDescription('Name of the formula to remove.')
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand((sub) =>
			sub //
				.setName('help')
				.setDescription('Show help and instructions for the calculator.')
		)
)
export class UserCommand extends Subcommand {
	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'name') {
			const userId = interaction.user.id;
			const query = focusedOption.value.toLowerCase();

			try {
				const result = await db.query('SELECT name FROM user_formulas WHERE user_id = $1', [userId]);
				let formulas = result.rows.map((r: any) => r.name);

				if (query) {
					formulas = formulas.filter((name: string) => name.toLowerCase().includes(query));
				}

				return interaction.respond(
					formulas.slice(0, 25).map((name: string) => ({ name, value: name }))
				);
			} catch {
				return interaction.respond([]);
			}
		}
	}

	// #region eval
	public async calcEvalSlash(interaction: Command.ChatInputCommandInteraction) {
		const expression = interaction.options.getString('expression', true);
		const result = this.evaluate(expression);
		if (result.error) return interaction.reply({ content: `**ERROR**: ${result.error}`, flags: MessageFlags.Ephemeral });
		return interaction.reply({ content: `**Result**: ${result.value}`, flags: MessageFlags.Ephemeral });
	}

	public async calcEvalMsg(msg: Message, args: Args) {
		const expression = await args.rest('string').catch(() => null);
		if (!expression) return reply(msg, this.getHelpMessage());
		const result = this.evaluate(expression);
		if (result.error) return reply(msg, `**ERROR**: ${result.error}`);
		return reply(msg, `**Result**: ${result.value}`);
	}
	// #endregion

	// #region save
	public async calcSaveSlash(interaction: Command.ChatInputCommandInteraction) {
		const name = interaction.options.getString('name', true);
		const expression = interaction.options.getString('expression', true);
		const result = await this.saveFormula(interaction.user.id, name, expression);
		return interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
	}

	public async calcSaveMsg(msg: Message, args: Args) {
		const name = await args.pick('string').catch(() => null);
		if (!name) return reply(msg, '**ERROR**: No formula name provided.\nUsage: `calc save <name> <expression>`');
		const expression = await args.rest('string').catch(() => null);
		if (!expression) return reply(msg, '**ERROR**: No expression provided.\nUsage: `calc save <name> <expression>`');
		const result = await this.saveFormula(msg.author.id, name, expression);
		return reply(msg, result);
	}
	// #endregion

	// #region use
	public async calcUseSlash(interaction: Command.ChatInputCommandInteraction) {
		const name = interaction.options.getString('name', true);
		const variablesStr = interaction.options.getString('variables', true);
		const result = await this.useFormula(interaction.user.id, name, variablesStr);
		return interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
	}

	public async calcUseMsg(msg: Message, args: Args) {
		const name = await args.pick('string').catch(() => null);
		if (!name) return reply(msg, '**ERROR**: No formula name provided.\nUsage: `calc use <name> <var:val> ...`');
		const variablesStr = await args.rest('string').catch(() => null);
		if (!variablesStr) return reply(msg, '**ERROR**: No variables provided.\nUsage: `calc use <name> <var:val> ...`');
		const result = await this.useFormula(msg.author.id, name, variablesStr);
		return reply(msg, result);
	}
	// #endregion

	// #region list
	public async calcListSlash(interaction: Command.ChatInputCommandInteraction) {
		const result = await this.listFormulas(interaction.user.id);
		return interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
	}

	public async calcListMsg(msg: Message) {
		const result = await this.listFormulas(msg.author.id);
		return reply(msg, result);
	}
	// #endregion

	// #region remove
	public async calcRemoveSlash(interaction: Command.ChatInputCommandInteraction) {
		const name = interaction.options.getString('name', true);
		const result = await this.removeFormula(interaction.user.id, name);
		return interaction.reply({ content: result, flags: MessageFlags.Ephemeral });
	}

	public async calcRemoveMsg(msg: Message, args: Args) {
		const name = await args.pick('string').catch(() => null);
		if (!name) return reply(msg, '**ERROR**: No formula name provided.\nUsage: `calc remove <name>`');
		const result = await this.removeFormula(msg.author.id, name);
		return reply(msg, result);
	}
	// #endregion

	// #region help
	public async calcHelpSlash(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply({ content: this.getHelpMessage(), flags: MessageFlags.Ephemeral });
	}

	public async calcHelpMsg(msg: Message) {
		return reply(msg, this.getHelpMessage());
	}

	private getHelpMessage(): string {
		return [
			'**Calculator Help**',
			'The calculate command supports standard math operators (`+`, `-`, `*`, `/`, `^`) and variables.',
			'',
			'**Some useful functions:**',
			'- `sqrt(x)` - Square root',
			'- `nrt(x, n)` - `n`th root of `x` (e.g., `nrt(8, 3)` = 2)',
			'- `round(x, n)` - Rounds `x` to `n` decimal places',
			'- `abs(x)` - Absolute value',
			'- `factorial(x)` - Factorial',
			'- `sin(x)`, `cos(x)`, `tan(x)` - Trigonometry',
			'- `log10(x)`, `log2(x)`, `logn(x, n)` - Logarithms',
			'',
			'_Full list of standard functions available [here](<https://github.com/silentmatt/expr-eval?tab=readme-ov-file#expression-syntax>)_',
			'',
			'**Subcommands:**',
			'- `eval <expression>` - Evaluate an expression.',
			'- `save <name> <expression>` - Save a formula containing variables (e.g., `save volume l * w * h`).',
			'- `use <name> <variables>` - Use a saved formula with positional values (e.g., `use volume 5 10 2`) OR explicitly by name (e.g., `use volume l:5 w:10 h:2`).',
			'- `list` - Shows all your saved formulas.',
			'- `remove <name>` - Remove a saved formula.',
			'- `help` - Show this message.'
		].join('\n');
	}
	// #endregion

	// #region helpers
	private evaluate(expression: string, vars: Record<string, number> = {}): { value?: string; error?: string } {
		try {
			const value = mathParser.evaluate(expression, vars);
			return { value: String(value) };
		} catch (err: any) {
			return { error: err.message ?? 'Invalid expression.' };
		}
	}

	private parseVariables(variablesStr: string, expression: string): Record<string, number> | null {
		const parts = variablesStr
			.trim()
			.split(/\s+/)
			.filter((p) => p.length > 0);

		if (parts.length === 0) return {};

		if (parts.some((p) => p.includes(':'))) {
			return this.parseNamedVariables(parts);
		}

		return this.parsePositionalVariables(parts, expression);
	}

	private parseNamedVariables(parts: string[]): Record<string, number> | null {
		const vars: Record<string, number> = {};
		for (const part of parts) {
			const colonIdx = part.indexOf(':');
			if (colonIdx === -1) return null; // mixed formats
			const key = part.slice(0, colonIdx);
			const num = Number(part.slice(colonIdx + 1));
			if (!key || Number.isNaN(num)) return null;
			vars[key] = num;
		}
		return vars;
	}

	private parsePositionalVariables(parts: string[], expression: string): Record<string, number> | null {
		let expectedVars: string[];
		try {
			expectedVars = mathParser.parse(expression).variables();
		} catch {
			return null;
		}

		if (parts.length < expectedVars.length) {
			return null; // not enough arguments provided
		}

		const vars: Record<string, number> = {};
		for (let i = 0; i < expectedVars.length; i++) {
			const num = Number(parts[i]);
			if (Number.isNaN(num)) return null;
			vars[expectedVars[i]] = num;
		}
		return vars;
	}

	private async saveFormula(userId: string, name: string, expression: string): Promise<string> {
		const normalizedName = name.toLowerCase();

		if (!/^[a-z0-9_-]+$/i.test(normalizedName)) {
			return '**ERROR**: Formula name can only contain letters, numbers, underscores, and hyphens.';
		}

		try {
			mathParser.parse(expression);
		} catch (err: any) {
			const reservedKeywords = new Set(
				[
					...Object.keys((mathParser as any).functions || {}),
					...Object.keys((mathParser as any).consts || {}),
					...Object.keys((mathParser as any).unaryOps || {}),
					...Object.keys((mathParser as any).binaryOps || {})
				].filter((w) => /^[a-zA-Z]+$/.test(w))
			);

			const wordsInExpression = expression.match(/[a-zA-Z]+/g) || [];
			const foundReserved = wordsInExpression.filter((word) => reservedKeywords.has(word));
			const uniqueReserved = [...new Set(foundReserved)];

			let hint = '';
			if (uniqueReserved.length > 0) {
				hint = `\n*Hint: You might be using reserved keywords as variable names: \`${uniqueReserved.join('`, `')}\`. Try using different names.*`;
			}

			return `**ERROR**: Invalid expression: ${err.message}${hint}`;
		}

		await db.query(
			`INSERT INTO user_formulas (user_id, name, expression)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (user_id, name) DO UPDATE SET expression = EXCLUDED.expression`,
			[userId, normalizedName, expression]
		);

		return `**Saved**: \`${normalizedName}\` = \`${expression}\``;
	}

	private async useFormula(userId: string, name: string, variablesStr: string): Promise<string> {
		const normalizedName = name.toLowerCase();
		const row = await db.query('SELECT expression FROM user_formulas WHERE user_id = $1 AND name = $2', [userId, normalizedName]);

		if (!row.rows.length) {
			return `**ERROR**: No formula named \`${normalizedName}\` found. Use \`calc list\` to see your saved formulas.`;
		}

		const variables = this.parseVariables(variablesStr, row.rows[0].expression);
		if (!variables) {
			const expectedVars = mathParser.parse(row.rows[0].expression).variables();
			const examplePositional = expectedVars.map(() => '5').join(' ');
			const exampleKeyValue = expectedVars.map((v) => v + ':5').join(' ');
			return `**ERROR**: Invalid variable format. Please provide values for \`${expectedVars.join(', ')}\` in order (e.g., \`${examplePositional}\`) OR as \`key:value\` pairs (e.g., \`${exampleKeyValue}\`).`;
		}

		try {
			const value = mathParser.evaluate(row.rows[0].expression, variables);
			const varDisplay = Object.entries(variables)
				.map(([k, v]) => `${k}=${v}`)
				.join(', ');
			return `**${normalizedName}** (${varDisplay}) = **${value}**`;
		} catch (err: any) {
			return `**ERROR**: ${err.message}`;
		}
	}

	private async listFormulas(userId: string): Promise<string> {
		const result = await db.query('SELECT name, expression FROM user_formulas WHERE user_id = $1 ORDER BY name', [userId]);
		if (!result.rows.length) {
			return 'You have no saved formulas. Use `calc save <name> <expression>` to create one.';
		}
		const lines = result.rows.map((r: any) => `• **${r.name}**: \`${r.expression}\``);
		return `**Your Formulas:**\n${lines.join('\n')}`;
	}

	private async removeFormula(userId: string, name: string): Promise<string> {
		const normalizedName = name.toLowerCase();
		const result = await db.query('DELETE FROM user_formulas WHERE user_id = $1 AND name = $2 RETURNING name', [userId, normalizedName]);
		if (!result.rows.length) {
			return `**ERROR**: No formula named \`${normalizedName}\` found.`;
		}
		return `**Removed**: \`${normalizedName}\``;
	}
	// #endregion
}
