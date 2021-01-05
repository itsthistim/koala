const { Listener } = require('discord-akairo')
const { DiscordAPIError } = require('discord.js')
const Logger = require('../util/logger.js');;

module.exports = class CommandErrorListener extends Listener {
  constructor() {
    super('commandError', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec(err, message) {
    Logger.error('An error occured in a command.');

    const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
    Logger.error(message.content, {
      tag
    });
    Logger.stacktrace(err);

    if (message.guild ? message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES') : true) {
      message.channel.send([`An error occured, please contact ${this.client.users.cache.get(this.client.ownerID[0]).username + '#' + this.client.users.cache.get(this.client.ownerID[0]).discriminator}.`, '```js', err.toString(), '```']);
    }
  }
}