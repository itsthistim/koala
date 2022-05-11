const { Listener } = require('@sapphire/framework');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = class MusicTracksAddListener extends Listener {
  constructor(context) {
    super(context, {
      event: "tracksAdd",
      emitter: PLAYER
    });
  }

  async run(queue, track) {
    queue.metadata.channel.send({
      embeds: [
        {
          description: `Queued **${tracks.length}** tracks from [${tracks[0].playlist.title}](${tracks[0].playlist.url})`,
          color: 0x44b868
        }
      ]
    });
  }
}