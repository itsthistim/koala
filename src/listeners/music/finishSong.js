import { Listener } from '@sapphire/framework';

export default class AddSongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'finishSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		if (queue.npmessage) {
			if (song.metadata) {
				song.metadata.i.deleteReply().catch((err) => {});
			} else {
				queue.npmessage.delete().catch((err) => {});
			}
		}
	}
}
