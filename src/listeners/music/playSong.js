const { Listener } = require('@sapphire/framework');

module.exports = class PlaySongListener extends Listener {
    constructor(context) {
        super(context, {
            event: "playSong",
            emitter: "distube"
        });
    }

    async run(queue, song) {
        queue.textChannel.send({
            embeds: [{
                title: `Now playing`,
                description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
                thumbnail: {
                    url: `${song.thumbnail}`
                },
                color: COLORS.GREEN
            }]
        }).then((msg) => {
            queue.npmessage = msg;
        });
    }
}