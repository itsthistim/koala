const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed, GuildMember, Guild } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const moment = require('moment');

module.exports = class UserInfoCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'userinfo',
      aliases: ['userinfo', 'whois'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows information about a user.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    // const user = args.finished ? message.author : await args.pick('user');
    // const member = await message.guild.members.fetch(user.id).catch(() => null);

    let target = await args.pick('member').catch(async () => await args.pick('user').catch(() => message.member));

    const status = {
      online: "<:online:861986701580697670> ",
      idle: "<:idle:861986831541207042>",
      dnd: "<:dnd:861986768517070938> ",
      streaming: "<:streaming:861986871578722364>",
      offline: "<:offline:861986750952112189> "
    };

    if (target instanceof GuildMember) {
      if (target.presence) {
        for (let i = target.presence.activities.length - 1; i >= 0; i--) {
          if (target.presence.activities[i].type == 'CUSTOM_STATUS') {
            var userstatus = target.presence.activities[i].state;
          }
          else if (target.presence.activities[i].type == 'PLAYING') {
            var usergame = target.presence.activities[i].name;
          }
        }
      }

      message.guild.roles.cache.sort(function (x, y) {
        return y.position - x.position
      });

      const embed = new MessageEmbed()
        .setColor(COLORS.DEFAULT)
        .setAuthor({ name: target.user.username + '#' + target.user.discriminator, iconUrl: target.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`${target.presence ? status[target.presence.status] : ''}${target}`)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 2048 }))
        
        .addField(`Joined Server`, `${moment.utc(target.joinedAt).format('MMMM Do YYYY')}\n(${moment.utc(target.joinedAt).fromNow()})`, true)
        .addField(`Joined Discord`, `${moment(target.user.createdAt).format('MMMM Do YYYY')}\n(${moment(target.user.createdAt).fromNow()})`, true)
        .addField(`\u200b`, `\u200b`, true)
        .addField(`Playing`, `${usergame ? usergame : "Nothing"}`, true)
        .addField(`Badges`, `Coming soon!`, true)
        .addField(`\u200b`, `\u200b`, true)
        .addField(`Roles [${target.roles.cache.size - 1}]`, `${target.roles.cache.map(roles => `${roles}`).join(' ')}`, false)
        
        .setFooter({ text: `User ID: ${target.id}` });
      reply(message, { embeds: [embed] });
    }
    else {
      const embed = new MessageEmbed()
        .setColor(COLORS.DEFAULT)
        .setAuthor({ name: target.username + '#' + target.discriminator, iconUrl: target.displayAvatarURL({ dynamic: true }) })
        .setDescription(`${target}`)
        .setThumbnail(`${target.displayAvatarURL({ dynamic: true })}`)
        .addField(`Joined Discord`, `${moment(target.createdAt).format('MMMM Do YYYY')}\n(${moment(target.createdAt).fromNow()})`, true)
        .addField(`Playing`, `${usergame ? usergame : "Nothing"}`, true)
        .setFooter({ text: `User ID: ${target.id}` });
      reply(message, { embeds: [embed] });
    }
  }
}