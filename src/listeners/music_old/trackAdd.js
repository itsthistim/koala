const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicTrackAddListener extends Listener {
  constructor(context) {
    super(context, {
      event: "trackAdd",
      emitter: PLAYER
    });
  }

  async run(queue, track) {
    queue.metadata.channel.send({
      embeds: [
        {
          description: `Queued **[${track.title}](${track.url})**`,
          color: 0x44b868
        }
      ]
    });
  }
}