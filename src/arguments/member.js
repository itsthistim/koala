const { isTextBasedChannel } = require('@sapphire/discord.js-utilities');
const { Argument } = require('@sapphire/framework');
const ClientUtil = require('../utils/clientutil.js');
const { isNullish } = require('@sapphire/utilities');

class MemberArgument extends Argument {
  run(parameter, context) {
    const value = ClientUtil.resolveMember(parameter, context.message.guild.members.cache);

    if (!isNullish(value)) {
      return this.ok(value);
    }

    return this.error({
      context,
      parameter,
      message: 'The provided argument could not be resolved to a member.',
      identifier: 'InvalidMember'
    });
  }
}

module.exports = {
  MemberArgument
};