import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import { type Message } from 'discord.js';
import deleteAllCommands from '#utils/deleteAllCommands';

@ApplyOptions<Command.Options>({
	aliases: ['command-reset', 'commands-reset', 'reset-command', 'reset-commands'],
	description: 'Resets the application commands for this bot.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny, CommandOptionsRunTypeEnum.Dm],
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(msg: Message) {
		let guilds = this.container.client.guilds.cache.map((g) => g.id);
		await reply(msg, 'Resetting commands...');
		await deleteAllCommands(process.env.DISCORD_TOKEN!, this.container.client.application!.id, guilds);
		await reply(msg, 'Done, shutting down!');
		await this.container.client.destroy();
		return process.exit(0);
	}
}
