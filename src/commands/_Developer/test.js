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
    // var time = await args.pick('string').catch(() => null);

    // if (!time) {
    //   return reply(message, 'You must specify a time to mute the user.');
    // }

    // var duration = parse(time);

    // if (!duration) {
    //   return reply(message, 'You must specify a valid time to mute the user.');
    // }

    // if (duration < 1000) {
    //   return reply(message, 'You must specify a time greater than 1 second.');
    // }

    // send(message, `${humanizeDuration(duration, { units: ['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms'] ,conjunction: " and ", serialComma: false })}`);

    // for (let i = 0; i < 100; i++) {
    //   if (i % 3 == 0 && i % 5 == 0) {
    //     console.log('FizzBuzz');
    //   }
    //   else if (i % 3 === 0) {
    //     console.log('Fizz');
    //   }
    //   else if (i % 5 === 0) {
    //     console.log('Buzz');
    //   }
    //   else {
    //     console.log(i);
    //   }
    // }

    for (let i = 0; i < 100; i++) {
      let out = '';

      switch (i) {
        case i % 3 == 0 && i % 5 == 0 && i % 7 == 0:
          out = 'FizzBuzzBazz';
          break;
        case i % 3 == 0 && i % 5 == 0:
          out = 'FizzBuzz';
          break;
        case i % 3 == 0 && i % 7 == 0:
          out = 'FizzBazz';
          break;
        case i % 5 == 0 && i % 7 == 0:
          out = 'BuzzBazz';
          break;
        case i % 3 == 0:
          out = 'Fizz';
          break;
        case i % 5 == 0:
          out = 'Buzz';
          break;
        case i % 7 == 0:
          out = 'Bazz';
          break;
        default:
          out = i;
          break;
      }
      console.log(out);
    }
  }
}