import { container, Listener } from "@sapphire/framework";

export default class ErrorListener extends Listener {
	constructor(context) {
		super(context, {
			event: "error",
			emitter: "distube"
		});
	}

	async run(channel, e) {
		if (channel) {
			channel.send({
				embeds: [
					{
						title: `An error occured`,
						description: `${e.toString().slice(0, 1974)}`,
						color: container.colors.RED
					}
				]
			});
		}
	}
}
