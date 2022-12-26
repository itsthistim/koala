const { Listener } = require('@sapphire/framework');

module.exports = class AddSongListener extends Listener {
    constructor(context) {
        super(context, {
            event: "finishSong",
            emitter: "distube"
        });
    }

    async run(queue, song) {
        if (queue.npmessage) {
            queue.npmessage.delete().catch(error => { });
        }
    }
}