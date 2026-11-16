import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type MessageCommandDeniedPayload, type UserError } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';

@ApplyOptions<Listener.Options>({ event: Events.MessageCommandDenied })
export class UserListener extends Listener<typeof Events.MessageCommandDenied> {
	public run({ context, message: content }: UserError, { message }: MessageCommandDeniedPayload) {
		if (Reflect.get(Object(context), 'silent')) return;
		return reply(message, { content, allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
