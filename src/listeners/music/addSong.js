import { Listener } from '@sapphire/framework';

export default class AddSongListener extends Listener {
	constructor(context) {
		super(context, {
			event: 'addSong',
			emitter: 'distube'
		});
	}

	async run(queue, song) {
		if (song.metadata) {
			if (song.metadata.i.replied) {
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
				song.metadata.i.reply({
					embeds: [
						{
							title: `Added to queue`,
							description: `**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}`,
							thumbnail: { url: `${song.thumbnail}` },
							color: COLORS.GREEN
						}
					]
				});
			}
		} else {
			queue.textChannel.send({
				embeds: [
					{
						title: `Added to queue`,
						description: `**[${song.name}](${song.url})** - **[${song.uploader.name}](${song.uploader.url})** | ${song.user}`,
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
