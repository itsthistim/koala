const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const moment = require('moment');

module.exports = class ServerInfoCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'serverinfo',
      aliases: ['serverinfo', 'server'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows information about the server.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {

    let humans = message.guild.members.cache.filter(member => !member.user.bot).size;
    let bots = message.guild.members.cache.filter(member => member.user.bot).size;

    const embed = new MessageEmbed()
      .setColor(COLORS.DEFAULT)
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addField(`Server Details`, `Owner: <@${message.guild.ownerId}>` +
        `\nRoles: ${message.guild.roles.cache.size}` +
        `\nChannels: ${message.guild.channels.cache.size}` +
        `\nBoosts: ${message.guild.premiumSubscriptionCount} (Level: ${message.guild.premiumTier == 'NONE' ? 0 : message.guild.premiumTier})`, true)
      .addField(`\u200B`, `Members: ${humans}🧑 ${bots}🤖 | ${message.guild.memberCount}` +
        `\nEmojis: ${message.guild.emojis.cache.size}` +
        `\nCreated: ${moment(message.guild.createdAt).format('MMM Do YYYY, hh:mm a')}` +
        `\nID: \`${message.guild.id}\``, true)
        .setThumbnail(message.guild.iconURL());

    return reply(message, { embeds: [embed] });
  }
}