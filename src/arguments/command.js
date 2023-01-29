import { Argument } from '@sapphire/framework';

export class CLientArgument extends Argument {
	constructor(context) {
		super(context, { name: 'category' });
	}

	async run(parameter, context) {
		const resolved = this.container.stores.get('commands').get(parameter.toLowerCase());
		if (resolved !== undefined && this.isAllowed(resolved, context)) return this.ok(resolved);
		return this.error({ parameter, context });
	}

	isAllowed(command, context) {
		return true;
		// 	if (command.permissionLevel !== PermissionLevels.BotOwner) return true;
		// 	return context.owners ?? OWNERS.includes(context.message.author.id);
	}
}
