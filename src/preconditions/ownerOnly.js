const { Precondition } = require('@sapphire/framework');

module.exports = class OwnerOnlyPrecondition extends Precondition {
  messageRun(message) {

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