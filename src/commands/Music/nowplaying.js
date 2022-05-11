const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class NowPlayingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'nowplaying',
      aliases: ['nowplaying', 'playing', 'np'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows the current song.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const queue = PLAYER.getQueue(message.guild);

    if (!queue || !queue.playing) {
      const embed = new MessageEmbed()
        .setColor(COLORS.RED)
        .setDescription(`There's nothing currently playing in the server.`);
      return message.reply({ embeds: [embed] });
    }

    const progress = queue.createProgressBar({ timecodes: true, length: 8 });

    const embed = new MessageEmbed()
      .setColor(COLORS.GREEN)
      .setThumbnail(queue.current.thumbnail)
      .setTitle(``)
      .setDescription(`**[${queue.current.title}](${queue.current.url})** - ${queue.current.requestedBy}`)
      .addField(`\u200b`, progress.replace(/ 0:00/g, ' ◉ LIVE'));
    return reply(message, { embeds: [embed] });
  }
}