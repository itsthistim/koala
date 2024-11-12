import { Argument } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { resolveMember } from "#lib/util";

export class MemberArgument extends Argument {
	async run(parameter, context) {
		const members = context.message.guild.members.cache.sort((a, b) => a.user.username.localeCompare(b.user.username));
		const value = resolveMember(parameter, members);

		if (!isNullish(value)) {
			return this.ok(value);
		}

		return this.error({
			context,
			parameter,
			message: "The provided argument could not be resolved to a member.",
			identifier: "InvalidMember"
		});
	}
}
