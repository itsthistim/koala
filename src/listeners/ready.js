	const { Listener } = require('discord-akairo');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	async exec() {
		this.client.logger.info(`${this.client.user.tag} is ready to serve ${this.client.users.cache.size} users in ${this.client.guilds.cache.size} servers.`, 'ready');

		//#region DB
		setInterval(async () => {
            let [ data ] = await DB.query(`SELECT * FROM KeepAlive`);
            if (data.length === 0) {
                await DB.query(`INSERT INTO KeepAlive VALUES(?)`, [ '.' ]);
                await DB.query('DELETE FROM KeepAlive');
            } else {
                await DB.query('DELETE FROM KeepAlive');
                console.log('[DEBUG] No items were deleted (Table was already empty)');
            }
        }, 150000);
		//#endregion
		//#region Status
		let statuses = ['you!', `${global.gprefixes[0]}help`];

		setInterval(() => {
			let status = statuses[Math.floor(Math.random() * statuses.length)];
			this.client.user.setActivity(`${status}`, { type: "WATCHING" });
		}, 10000);
		//#endregion
	}
}