import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';

export const loadingMessages = ['Computing...', 'Thinking...', 'Cooking...', 'Give me a moment...', 'Loading...'];

export const colors = {
	default: 0x9bacb4,
	green: 0x57f287,
	red: 0xed4245,
	blue: 0x3498db,
	yellow: 0xe67e22
};

export interface CommandAvailability {
	integrationTypes: ApplicationIntegrationType[];
	contexts: InteractionContextType[];
}

export const availability: Record<'anywhere' | 'guildOnly', CommandAvailability> = {
	anywhere: {
		integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
		contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]
	},
	guildOnly: {
		integrationTypes: [ApplicationIntegrationType.GuildInstall],
		contexts: [InteractionContextType.Guild]
	}
};
