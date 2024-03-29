import { Listener, container } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from 'colorette';
import { ActivityType } from 'discord.js';

const environmentType = process.env.NODE_ENV === 'DEVELOPMENT';
const llc = environmentType ? magentaBright : white;
const blc = environmentType ? magenta : blue;

export class ReadyEvent extends Listener {
	constructor(context, options = {}) {
		super(context, {
			...options,
			once: true,
			event: 'ready'
		});
	}

	async run() {
		container.color = {
			PASTEL_GREEN: 0x87de7f,
			CHERRY_RED: 0x8e3741,
			BLURPLE: 0x5865f2,
			BLURPLE_CLASSIC: 0x7289da,
			GREYPLE: 0x99aab5,
			DARK_BUT_NOT_BLACK: 0x2c2f33,
			NOT_QUITE_BLACK: 0x23272a
		};

		container.emoji = {
			POSITIVE: '<:positive:1017154150464753665>',
			NEGATIVE: '<:negative:1017154192525250590>',
			NEUTRAL: '<:neutral:1017154199735259146>'
		};

		this.printBanner();
		this.printStoreDebugInformation();
		await this.setStatus();
	}

	/**
	 * Sets the bot's status.
	 */
	async setStatus() {
		client.user.setPresence({ activities: [{ name: 'eucalyptus grow.', type: ActivityType.Watching }], status: 'online' }); // dnd, idle, online, invisible
	}

	/**
	 * Prints a magenta (DEVELOPMENT) or blue (PRODUCTION) info banner depending on the NODE_ENV.
	 */
	async printBanner() {
		client.logger.info(
			`[${green('+')}] Gateway online\n` +
			`${environmentType ? `${blc('</>') + llc(` ${process.env.NODE_ENV} ENVIRONMENT`)}` : 'PRODUCTION ENVIRONMENT'}\n` +
			`${llc(`v${process.env.VERSION}`)}`
		);

		const dbStatus = await dbPool
			.getConnection()
			.then(() => `Connected to database ${green(process.env.DB_NAME)} on ${llc(process.env.DB_HOST)}:${blc(process.env.DB_PORT)}`)
			.catch(() => `Failed to connect to database ${redBright(process.env.DB_NAME)} on ${redBright(process.env.DB_HOST)}:${red(process.env.DB_PORT)}`);
		this.container.logger.info(dbStatus);
	}

	/**
	 * Prints the loaded stores.
	 */
	printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const first = stores.shift();
		const last = stores.pop();

		logger.info(this.styleStore(first, '┌─'));
		for (const store of stores) logger.info(this.styleStore(store, '├─'));
		logger.info(this.styleStore(last, '└─'));
	}

	/**
	 * Helper function for styling the store name.
	 */
	style = environmentType ? yellow : blue;

	/**
	 * Adds a symbol before a loaded store.
	 * @param {Store} store The store that got loaded.
	 * @param {string} prefix The symbol to show before the loaded store.
	 * @returns {string} The styled string to print.
	 */
	styleStore(store, prefix) {
		return gray(`${prefix} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
