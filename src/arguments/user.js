const { Argument } = require('@sapphire/framework');
const ClientUtil = require('../utils/clientutil.js');
const { isNullish } = require('@sapphire/utilities');

class UserArgument extends Argument {
  run(parameter, context) {
    const value = ClientUtil.resolveUser(parameter, this.container.client.users.cache);

    if (!isNullish(value)) {
      return this.ok(value);
    }

    return this.error({
      context,
      parameter,
      message: 'The provided argument could not be resolved to a member.',
      identifier: 'InvalidUser'
    });
  }
}

module.exports = {
  UserArgument
};