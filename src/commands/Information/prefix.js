const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');

class PrefixCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'prefix',
      aliases: ['prefix'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows the current prefix.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message) {
    const { client } = this.container;
    return reply(message, `My prefix is \`${client.options.defaultPrefix[0]}\``);
  }
}

module.exports = {
  PrefixCommand
};