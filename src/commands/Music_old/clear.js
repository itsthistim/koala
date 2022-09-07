const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, generateDependencyReport } = require('@discordjs/voice');

module.exports = class ClearCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'clear',
      aliases: ['queueclear', 'queue-clear', 'clearqueue', 'clear-queue', 'qclear', 'clearq'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['CONNECT', 'SPEAK', 'USE_VAD'],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Clears the current queue.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const queue = PLAYER.getQueue(message.guild);
    if (!queue) {
      return reply(message, { embeds: [{ description: `❌ | There is no queue to clear.`, color: COLORS.RED }] });
    }
    queue.clear();
    return reply(message, { embeds: [{ description: `✅ | **Cleared** the queue.`, color: COLORS.GREEN }] });
  }
}