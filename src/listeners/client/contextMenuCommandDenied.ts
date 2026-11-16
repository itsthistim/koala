import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ContextMenuCommandDeniedPayload, type UserError } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandDenied })
export class UserListener extends Listener<typeof Events.ContextMenuCommandDenied> {
	public async run({ message: content }: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
		if (interaction.deferred || interaction.replied) return interaction.editReply({ content });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}
}
