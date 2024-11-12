import { Listener } from "@sapphire/framework";
import { blue, gray, green, magenta, magentaBright, white, yellow, redBright, red } from "colorette";
import { ActivityType } from "discord.js";
import db from "#lib/db";

const environmentType = process.env.NODE_ENV === "DEVELOPMENT";
const llc = environmentType ? magentaBright : white;
const blc = environmentType ? magenta : blue;

const version = process.env.npm_package_version;

export class ReadyEvent extends Listener {
	constructor(context, options = {}) {
		super(context, {
			...options,
			once: true,
			event: "ready"
		});
	}

	async run() {
		this.printBanner();
		this.printStoreDebugInformation();
		await this.setStatus();
	}

	async setStatus() {
		this.container.client.user.setPresence({ activities: [{ name: "eucalyptus grow.", type: ActivityType.Watching }], status: "online" }); // dnd, idle, online, invisible
	}

	async printBanner() {
		console.info(`[${green("+")}] Gateway online\n` + `${environmentType ? `${blc("</>") + llc(` ${process.env.NODE_ENV} ENVIRONMENT`)}` : "PRODUCTION ENVIRONMENT"}\n` + `${llc(`v${version}`)}`);
	}

	printStoreDebugInformation() {
		const { client } = this.container;
		const stores = [...client.stores.values()];
		const first = stores.shift();
		const last = stores.pop();

		console.info(this.styleStore(first, "┌─"));
		for (const store of stores) console.info(this.styleStore(store, "├─"));
		console.info(this.styleStore(last, "└─"));
	}

	style = environmentType ? yellow : blue;

	styleStore(store, prefix) {
		return gray(`${prefix} Loaded ${this.style(store.size.toString().padEnd(3, " "))} ${store.name}.`);
	}
}
