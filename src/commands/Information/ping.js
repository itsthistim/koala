const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const { send, reply } = require("@sapphire/plugin-editable-commands");

module.exports = class PingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "ping",
      aliases: ["pong"],
      preconditions: [],
      description: "See the bot's latency."
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) => {
      builder.setName(this.name)
      builder.setDescription(this.description)
    }, {
      idHints: '995013895217491968'
    })
  }

  async chatInputRun(interaction) {
    const ping = Math.round(this.container.client.ws.ping);
    const msg = await interaction.reply({
      content: `🤖 API latency: **${ping} ms**`,
      embeds: [],
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      return interaction.editReply(
        `🤖 API latency: **${ping}ms**\n💬 Message latency: **${diff}ms**\n`
      );
    }
    return interaction.editReply("Failed to retrieve ping.");
  }

  async messageRun(message) {
    const msg = await reply(message, {
      embeds: [
        {
          description: `🤖 API latency: **${this.container.client.ws.ping} ms**`,
          color: COLORS.RED,
        },
      ],
    });

    return send(message, {
      embeds: [
        {
          description: `🤖 API latency: **${this.container.client.ws.ping
            } ms**\n💬 Message latency: **${msg.createdTimestamp - message.createdTimestamp
            } ms**\n`,
          color: COLORS.GREEN,
        },
      ],
    });
  }
};
