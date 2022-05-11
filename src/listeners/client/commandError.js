const { Listener } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { codeBlock } = require('@sapphire/utilities');

module.exports = class CommandDeniedListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      once: false,
      event: "commandError"
    });
  }

  async run(error, { message, piece, parameters, args }) {
    reply(message, codeBlock('js', `${error.message}`));
  }
}