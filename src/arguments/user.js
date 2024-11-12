import { container, Argument } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { resolveUser } from "#lib/util";

export class ImageArgument extends Argument {
	async run(parameter, context) {
		const users = container.client.users.cache.sort((a, b) => a.username.localeCompare(b.username));
		const value = resolveUser(parameter, users);

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
