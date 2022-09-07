const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { MessageEmbed, MessageAttachment, Permissions } = require('discord.js');
const { codeBlock, isThenable } = require('@sapphire/utilities');
const { Time, Duration } = require('@sapphire/time-utilities');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { fetch, FetchResultTypes, FetchMethods } = require('@sapphire/fetch');
var parse = require('parse-duration');
const humanizeDuration = require("humanize-duration");

module.exports = class TestCommand extends Command {
  constructor(context, options) {
    super(context, {
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
      return reply(message, 'You must specify a time.');
    }

    var duration = parse(time, 's');

    if (!duration) {
      return reply(message, 'You must specify a valid time.');
    }

    if (duration < 1000) {
      return reply(message, 'You must specify a time greater than 1 second.');
    }

    send(message, `${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'] ,conjunction: " and ", serialComma: false })}`);
  }
}