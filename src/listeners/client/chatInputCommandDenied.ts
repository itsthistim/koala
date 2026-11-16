import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ChatInputCommandDeniedPayload, type UserError } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandDenied })
export class UserListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public async run({ message: content }: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (interaction.deferred || interaction.replied) return interaction.editReply({ content });
		return interaction.reply({ content, flags: MessageFlags.Ephemeral });
	}
}
