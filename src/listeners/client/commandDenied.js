const { Listener } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { codeBlock } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');

module.exports = class CommandDeniedListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      once: false,
      event: "commandDenied"
    });
  }

  async run(error, { message, command }) {

    if (error.code === 'missing-permissions') {
      reply(message, `I am missing the following permissions to execute this command: ${error.context.missing.join(', ')}`);
    }
    else {
      reply(message, error.message);
    }
  }
}