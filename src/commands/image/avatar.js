const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js');

module.exports = class AvatarCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'avatar',
      aliases: ['avatar'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows the avatar of a guild member.',
        usage: '<member>'
      }
    });
  }

  async messageRun(message, args) {
    const guildMember = await args.pick('member').catch(() => message.guild.members.cache.get(message.author.id));

    const embed = new MessageEmbed()
      .setAuthor({ name: guildMember.user.username + "#" + guildMember.user.discriminator, iconURL: guildMember.user.displayAvatarURL({ dynamic: true }) })
      .setImage(guildMember.user.displayAvatarURL({ dynamic: true, size: 1024 }));

    await reply(message, { embeds: [embed] });
  }
}