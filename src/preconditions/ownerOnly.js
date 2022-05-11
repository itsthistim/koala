const { Precondition } = require('@sapphire/framework');

class OwnerOnlyPrecondition extends Precondition {
  run(message) {

    let owners = ['319183644331606016'];

    if (owners.includes(message.author.id)) {
      return this.ok();
    }
    else {
      return this.error({
        message: 'Only the bot owner can use this command!',
        context: { silent: true }
      });
    };
  }
}

module.exports = {
  OwnerOnlyPrecondition
};