import { Listener } from '@sapphire/framework';

export default class AddSongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'addSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		console.log('addsong: already replied?', song.metadata?.i?.replied);
		if (song.metadata) {
			if (song.metadata.i.replied) {
				console.log('addsong: follow up!');
				song.metadata.i.followUp({
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
				});
			} else {
				console.log('addsong: reply!');
				song.metadata.i.reply({
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
				});
			}
		} else {
			console.log('addsong: send!');
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
			});
		}
	}
}
