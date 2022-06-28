const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicTrackEndListener extends Listener {
  constructor(context) {
    super(context, {
      event: "channelEmpty",
      emitter: PLAYER
    });
  }

  async run(queue) {
    console.log("channelEmpty")
  }
}