import { Listener } from '@sapphire/framework';

export default class PlaySongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'playSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		console.log('playsong: already replied?', song.metadata?.i?.replied);

		// Slash command logic
		if (song.metadata) {
			if (song.metadata.i.replied) {
				console.log('follow up!');
				song.metadata.i
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
			} else {
				console.log('reply!');
				song.metadata.i
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
		} else { // Message command logic
			console.log('send!');
			queue.textChannel
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
