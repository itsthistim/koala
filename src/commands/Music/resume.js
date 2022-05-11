const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, generateDependencyReport } = require('@discordjs/voice');

module.exports = class ResumeCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'resume',
      aliases: ['resume', 'continue'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['CONNECT', 'SPEAK', 'USE_VAD'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Resumes the current song.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const queue = PLAYER.getQueue(message.guild);
    if (!queue || !queue.playing) return reply(message, { embeds: [{ description: `❌ | There is nothing to resume.`, color: COLORS.RED }] });
    const paused = queue.setPaused(false);
    return paused ? reply(message, { embeds: [{ description: `▶️ | Resuming.`, color: COLORS.GREEN }] }) : reply(message, { embeds: [{ description: `❌ | There is nothing to resume.`, color: COLORS.RED }] });
  }
}