const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel, generateDependencyReport } = require('@discordjs/voice');

module.exports = class PlayCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'play',
      aliases: ['play', 'p', 'music', 'join'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['CONNECT', 'SPEAK', 'USE_VAD'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Plays a song.',
        usage: '<query>',
        examples: ['bitch lasagna', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ']
      }
    });
  }

  async messageRun(message, args) {
    const query = await args.rest('string').catch(() => null);

    if (!query) return await reply(message, { embeds: [{ description: `❌  | Please provide a query to search for!`, color: COLORS.RED }] });


    const user_vc = message.member.voice.channel;
    const client_vc = message.guild.me.voice.channel;
    if (!user_vc) return await reply(message, { embeds: [{ description: `❌  | You are not in a voice channel.`, color: COLORS.RED }] });
    if (client_vc && user_vc.id !== client_vc.id) return await reply(message, { embeds: [{ description: `❌  | You are not in my voice channel.`, color: COLORS.RED }] });

    // create queue
    const queue = PLAYER.createQueue(message.guild, {
      metadata: { channel: message.channel },
      bufferingTimeout: 1000,
      disableVolume: true, // disabling volume controls can improve performance
      leaveOnEnd: true,
      leaveOnStop: false,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 5000
    });

    // connect
    try {
      if (!queue.connection) {
        await queue.connect(user_vc);
      }
    } catch (err) {
      console.log(err);
      queue.destroy();
      return reply(message, { embeds: [{ description: `❌  | Could not join your voice channel.`, color: COLORS.RED }] });
    }

    // play track
    const track = await PLAYER.search(query, {
      requestedBy: message.member
    }).then(x => x.tracks[0]);
    if (!track) return await reply(message, { embeds: [{ description: `❌  | Track **${query}** not found!`, color: COLORS.RED }] });

    queue.play(track);
  }
}