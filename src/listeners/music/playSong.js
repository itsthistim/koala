import { Listener } from '@sapphire/framework';

export default class PlaySongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'playSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		if (song.metadata) {
			if (song.metadata.i.replied) {
				song.metadata.i
					.followUp({
						embeds: [
							{
								title: `Now playing`,
								description: `**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}`,
								thumbnail: {
									url: `${song.thumbnail}`
								},
								color: COLORS.DEFAULT
							}
						]
					})
					.then((msg) => {
						queue.npmessage = msg;
					});
			} else {
				song.metadata.i
					.reply({
						embeds: [
							{
								title: `Now playing`,
								description: `**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}`,
								thumbnail: {
									url: `${song.thumbnail}`
								},
								color: COLORS.DEFAULT
							}
						]
					})
					.then((msg) => {
						queue.npmessage = msg;
					});
			}
		} else {
			queue.textChannel
				.send({
					embeds: [
						{
							title: `Now playing`,
							description: `**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}`,
							thumbnail: {
								url: `${song.thumbnail}`
							},
							color: COLORS.DEFAULT
						}
					]
				})
				.then((msg) => {
					queue.npmessage = msg;
				});
		}
	}
}
