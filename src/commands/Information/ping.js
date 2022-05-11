const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');

module.exports = class PingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'ping',
      aliases: ['pong'],
      preconditions: [],
      description: {
        content: 'Pong!',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message) {
    const msg = await reply(message, {
      embeds: [{
        description: `🤖 API latency: **${this.container.client.ws.ping} ms**`,
        color: COLORS.RED
      }]
    });

    return send(message, {
      embeds: [{
        description: `🤖 API latency: **${this.container.client.ws.ping} ms**\n💬 Message latency: **${msg.createdTimestamp - message.createdTimestamp} ms**\n`,
        color: COLORS.GREEN
      }]
    });
  }
}