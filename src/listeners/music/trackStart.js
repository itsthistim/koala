const { Listener } = require('@sapphire/framework');

module.exports = class MusicTrackStartListener extends Listener {
  constructor(context) {
    super(context, {
      event: "trackStart",
      emitter: PLAYER
    });
  }

  async run(queue, track) {
    if (queue.npmessage) {
      queue.npmessage.delete().catch(error => { });
    }

    queue.metadata.channel.send({
      embeds: [
        {
          title: `Now playing`,
          description: `**[${track.title}](${track.url})** - ${track.requestedBy}`,
          thumbnail: {
            url: `${track.thumbnail}`
          },
          color: 0x44b868,
        }
      ]
    }).then((msg) => {
      queue.npmessage = msg;
    });
  }
}