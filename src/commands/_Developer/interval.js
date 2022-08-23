const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class IntervalCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'interval',
      aliases: ['interval'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Sends messages in an interval',
        usage: '[cooldown] [amount] <text>',
        examples: ['7 3 Hello World!', '4 10 Hi!']
      }
    });
  }

  async messageRun(message, args) {
    const cooldown = await args.pick('number').catch(() => 7);
    const amount = await args.pick('number').catch(() => 3);
    const text = await args.rest('string').catch(() => null);

    if (!text) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} You need to specify a text.`, color: COLORS.RED }] });

    if (text) {
      message.channel.send(text);
      for (let i = 1; i < amount; i++) {
        setTimeout(() => {
          message.channel.send(text);
        }, cooldown * Time.Second);
      }
    }
  }
}