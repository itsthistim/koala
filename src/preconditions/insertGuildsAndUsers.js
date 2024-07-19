import { AllFlowsPrecondition } from '@sapphire/framework';
import { ClientUtil } from '#lib/util';

export class insertGuildsAndUsersPrecondition extends AllFlowsPrecondition {
	async chatInputRun(interaction) {
		try {
			const userExists = await ClientUtil.checkIfUserExists(interaction);
			const guildExists = await ClientUtil.checkIfGuildExists(interaction);

			// if user does not exist insert user into database
			if (!userExists) await ClientUtil.insertUser(interaction);
			// if guild does not exist insert guild into database
			if (!guildExists) await ClientUtil.insertGuild(interaction);

			return this.ok();
		} catch (error) {
			return this.error({ message: error });
		}
	}

	async contextMenuRun(interaction) {
		try {
			const userExists = await ClientUtil.checkIfUserExists(interaction);
			const guildExists = await ClientUtil.checkIfGuildExists(interaction);

			// if user does not exist insert user into database
			if (!userExists) await ClientUtil.insertUser(interaction);
			// if guild does not exist insert guild into database
			if (!guildExists) await ClientUtil.insertGuild(interaction);

			return this.ok();
		} catch (error) {
			return this.error({ message: error });
		}
	}
}
