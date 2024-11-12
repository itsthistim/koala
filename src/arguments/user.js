import { Argument } from "@sapphire/framework";
import { ClientUtil } from "#lib/util";
import { isNullish } from "@sapphire/utilities";

export class ImageArgument extends Argument {
	async run(parameter, context) {
		const users = this.container.client.users.cache.sort((a, b) => a.username.localeCompare(b.username));
		const value = ClientUtil.resolveUser(parameter, users);

		if (!isNullish(value)) {
			return this.ok(value);
		}

		return this.error({
			context,
			parameter,
			message: "The provided argument could not be resolved to a member.",
			identifier: "InvalidUser"
		});
	}
}
