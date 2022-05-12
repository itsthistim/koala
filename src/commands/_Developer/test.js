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
var parse = require('parse-duration');
const humanizeDuration = require("humanize-duration");
const { format } = require('path');
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
    var time = await args.pick('string').catch(() => null);

    if (!time) {
      return reply(message, 'You must specify a time to mute the user.');
    }

    var duration = parse(time);

    if (!duration) {
      return reply(message, 'You must specify a valid time to mute the user.');
    }

    if (duration < 1000) {
      return reply(message, 'You must specify a time greater than 1 second.');
    }

console.log(duration);

    send(message, `${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'] ,conjunction: " and ", serialComma: false })}`);
  }
}