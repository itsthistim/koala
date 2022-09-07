const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const owoify = require('owoify-js').default

module.exports = class SayCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'say',
      aliases: ['say'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: ['tts', 'owo', 'uwu', 'uvu', 'delete', 'del', 'd', 'embed', 'e'],
      options: [],
      nsfw: false,
      description: {
        content: 'Says something.',
        usage: '<text>',
        examples: ['Hello world!']
      }
    });
  }

  async messageRun(message, args) {
    let text = await args.rest('string').catch(() => null);

    const tts = args.getFlags('tts');
    const owo = args.getFlags('owo', 'uwu', 'uvu');
    const del = args.getFlags('delete', 'del', 'd');
    const isEmbed = args.getFlags('embed', 'e');

    if (!text) return reply(message, 'You need to provide a text to say!');
    if (text.length > 2000) return reply(message, 'Your text is too long!');

    if (owo) {
      text = owoify(text);
    }

    if (isEmbed) {
      const embed = new MessageEmbed();
      embed.setColor(COLORS.GREYPLE);
      embed.setDescription(text);

      if (del) {
        await message.delete().catch(() => { });
        return send(message, { embeds: [embed], allowedMentions: { parse: [], repliedUser: true } });
      } else {
        return reply(message, { embeds: [embed], allowedMentions: { parse: [], repliedUser: true } });
      }
    }
    else {
      if (del) {
        await message.delete().catch(() => { });
        return send(message, { content: text, tts: tts, allowedMentions: { parse: [], repliedUser: true } });
      } else {
        return reply(message, { content: text, tts: tts, allowedMentions: { parse: [], repliedUser: true } });
      }
    }
  }
}
