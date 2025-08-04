import { Listener } from "@sapphire/framework";

export default class InitQueueListener extends Listener {
	constructor(context) {
		super(context, {
			event: "initQueue",
			emitter: "distube"
		});
	}

	async run(queue) {
		queue.volume = 75;
	}
}
