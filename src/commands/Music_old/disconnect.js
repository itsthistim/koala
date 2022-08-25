const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');

module.exports = class DisconnectCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'disconnect',
      aliases: ['disconnect', 'dc'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Disconnects the bot and clears the current queue.',
        usage: '',
        examples: []
      },
      detailedDescription: ''
    });
  }

  async messageRun(message, args) {
    const queue = PLAYER.getQueue(message.guild);
    if (queue) queue.destroy(true);
    message.guild.me.voice.disconnect().catch(() => reply(message, 'I\'m not in a voice channel.'));
  }
}