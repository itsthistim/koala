const { Listener } = require('@sapphire/framework');

module.exports = class ReadyListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      once: true,
      event: "ready"
    });
  }

  run(client) {
    const { username, id } = client.user;
    this.container.logger.info(`Successfully logged in as ${username} (${id})`);
    this.container.client.user.setActivity(`${client.options.defaultPrefix[0]}help`, { type: "LISTENING" });
  }
}