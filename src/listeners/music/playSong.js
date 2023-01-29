import { Listener } from '@sapphire/framework';

export default class PlaySongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'playSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		// Slash command logic
		if (song.metadata) {
			if (song.metadata.i.replied) {				song.metadata.i
					.followUp({
						embeds: [
							{
								title: `Now playing`,
								description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
								thumbnail: {
									url: `${song.thumbnail}`
								},
								color: COLORS.GREEN
							}
						]
					})
					.then((msg) => {
						queue.npmessage = msg;
					});
			} else {				song.metadata.i
					.reply({
						embeds: [
							{
								title: `Now playing`,
								description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
								thumbnail: {
									url: `${song.thumbnail}`
								},
								color: COLORS.GREEN
							}
						]
					})
					.then((msg) => {
						queue.npmessage = msg;
					});
			}
		} else { // Message command logic			queue.textChannel
				.send({
					embeds: [
						{
							title: `Now playing`,
							description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
							thumbnail: {
								url: `${song.thumbnail}`
							},
							color: COLORS.GREEN
						}
					]
				})
				.then((msg) => {
					queue.npmessage = msg;
				});
		}
	}
}
