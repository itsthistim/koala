const { Listener } = require('@sapphire/framework');

module.exports = class AddSongListener extends Listener {
    constructor(context) {
        super(context, {
            event: "addSong",
            emitter: "distube"
        });
    }

    async run(queue, song) {
        queue.textChannel.send({
            embeds: [
                {
                    title: `Added to queue`,
                    description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
                    thumbnail: {
                        url: `${song.thumbnail}`
                    },
                    color: COLORS.GREEN
                }
            ]
        })
    }
}