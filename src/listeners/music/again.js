const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, generateDependencyReport } = require('@discordjs/voice');

module.exports = class ReplayCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'previous',
      aliases: ['previous', 'prev', 'replay', 'again'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['CONNECT', 'SPEAK', 'USE_VAD'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Replays the current track.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const user_vc = message.member.voice.channel;
    if (!user_vc) return await reply(message, { embeds: [{ description: `❌ | You are not in a voice channel.`, color: COLORS.RED }] });
    if (!queue) return await reply(message, { embeds: [{ description: `❌ | There is no track to replay.`, color: COLORS.RED }] });

    // connect
    try {
      if (!queue.connection) {
        await queue.connect(user_vc);
      }
    } catch (err) {
      console.log(err);
      queue.destroy();
      return reply(message, { embeds: [{ description: `❌ | Could not join your voice channel.`, color: COLORS.RED }] });
    }

    const client_vc = message.guild.me.voice.channel;
    if (client_vc.id && user_vc.id !== client_vc.id) return await reply(message, { embeds: [{ description: `❌ | You are not in my voice channel.`, color: COLORS.RED }] });

    // play track
    const track = await PLAYER.search(query, {
      requestedBy: message.member
    }).then(x => x.tracks[0]);
    if (!track) return await reply(message, { embeds: [{ description: `❌ | Track **${query}** not found!`, color: COLORS.RED }] });
    
    queue.play(track);
  }
}