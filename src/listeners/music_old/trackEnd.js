const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicTrackEndListener extends Listener {
  constructor(context) {
    super(context, {
      event: "trackEnd",
      emitter: PLAYER
    });
  }

  async run(queue, track) {
    if (queue.npmessage) {
      queue.npmessage.delete().catch(error => { });
    }
  }
}