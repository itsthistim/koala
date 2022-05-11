const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicConnectionErrorListener extends Listener {
  constructor(context) {
    super(context, {
      event: "connectionError",
      emitter: PLAYER
    });
  }

  async run(queue, error) {
    console.log(`(${queue.guild.name}) connectionError: ${error.message}`);
  }
}