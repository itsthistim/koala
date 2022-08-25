const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicErrorListener extends Listener {
  constructor(context) {
    super(context, {
      event: "error",
      emitter: PLAYER
    });
  }

  async run(queue, error) {
    console.log(`(${queue.guild.name}) error: ${error.message}`);
  }
}