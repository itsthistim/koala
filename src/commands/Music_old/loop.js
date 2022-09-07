const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { QueueRepeatMode } = require('discord-player');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = class LoopCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'loop',
      aliases: ['queueloop', 'queue-loop', 'loopqueue', 'loop-queue', 'qloop', 'loopq', 'repeat'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['CONNECT', 'SPEAK', 'USE_VAD'],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Loops the queue.',
        usage: '[off/track/queue/autoplay]',
        examples: ['', 'off', 'track', 'queue', 'autoplay']
      }
    });
  }

  async messageRun(message, args) {
    const option = await args.pick('string').catch(() => null);

    const queue = PLAYER.getQueue(message.guild);
    if (!queue) return reply(message, { embeds: [{ description: `❌ | There is nothing to loop.`, color: COLORS.RED }] });
    if (!option) {
      if (await queue.repeatMode === QueueRepeatMode.OFF || await queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        return reply(message, { embeds: [{ description: `🔄 | Looping the **queue**.`, color: COLORS.GREEN }] });
      }
      else if (await queue.repeatMode === QueueRepeatMode.QUEUE) {
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        return reply(message, { embeds: [{ description: `🔂 | Looping the **current track**.`, color: COLORS.GREEN }] });
      }
      else if (await queue.repeatMode === QueueRepeatMode.TRACK) {
        queue.setRepeatMode(QueueRepeatMode.OFF);
        return reply(message, { embeds: [{ description: `✅ | Looping is now **disabled**.`, color: COLORS.GREEN }] });
      }
    }

    if (option.includes("off") || option.includes("disable") || option.includes("none")) {
      queue.setRepeatMode(QueueRepeatMode.OFF);
      return reply(message, { embeds: [{ description: `✅ | Looping is now **disabled**.`, color: COLORS.GREEN }] });
    }
    else if (option.includes("track") || option.includes("song") || option.includes("current")) {
      queue.setRepeatMode(QueueRepeatMode.TRACK);
      return reply(message, { embeds: [{ description: `🔂 | Looping the **current track**.`, color: COLORS.GREEN }] });
    }
    else if (option.includes("queue") || option.includes("all")) {
      queue.setRepeatMode(QueueRepeatMode.QUEUE);
      return reply(message, { embeds: [{ description: `🔄 | Looping the **queue**.`, color: COLORS.GREEN }] });
    }
    else if (option.includes("autoplay")) {
      queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
      return reply(message, { embeds: [{ description: `▶️ | Enabled **auto play**.`, color: COLORS.GREEN }] });
    }
    else {
      const embed = new MessageEmbed()
      embed.setColor(COLORS.GREEN);
      let mode;
      if (await queue.repeatMode === QueueRepeatMode.OFF) mode = "`Off`";
      else if (await queue.repeatMode === QueueRepeatMode.TRACK) mode = "`Track`";
      else if (await queue.repeatMode === QueueRepeatMode.QUEUE) mode = "`Queue`";
      else if (await queue.repeatMode === QueueRepeatMode.AUTOPLAY) mode = "`Autoplay`";
      embed.setDescription(`Current mode: ${mode}\nOptions: \`off\`, \`track\`, \`queue\`, \`autoplay\``);
      reply(message, { embeds: [embed] });
    }
  }
}