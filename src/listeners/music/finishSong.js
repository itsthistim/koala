import { Listener } from '@sapphire/framework';

export default class AddSongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'finishSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		console.log('npmessage', queue.npmessage);

		if (song.metadata && queue.npmessage) {
			song.metadata.i.deleteReply().catch((err) => {
				console.log(err);
			});
		}

		if (!song.metadata && queue.npmessage) {
			queue.npmessage.delete().catch((err) => {
				console.log(err);
			});
		}
	}
}
