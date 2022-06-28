const { Listener } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class ReadyListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      event: "voiceStateUpdate"
    });
  }

  run(oldState, newState) {
    if (oldState.channelID !== oldState.guild.me.voice.channelID || newState.channel) return;

    if (!oldState.channel.members.size - 1)
      setTimeout(() => {
        if (!oldState.channel.members.size - 1) {
          console.log("leave")
          oldState.guild.me.voice.disconnect().catch(() => { });
        }
      }, Time.Second * 5);

  }
}