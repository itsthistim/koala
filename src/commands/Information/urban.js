// dev
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const urban = require('relevant-urban');

module.exports = class UrbanCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'urban',
      aliases: ['urban'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Looks up anything on urbandictionary.com.',
        usage: '<query>',
        examples: ['lmao', 'rofl']
      }
    });
  }

  async messageRun(message, args) {
    const term = await args.rest('string').catch(() => '');

    if (!term) {
      return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} You did not specify a term.`, color: COLORS.RED }] });
    }

    try {
      var res = await urban(term);
    } catch (error) {
      reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} I could not find anything for this query.`, color: COLORS.RED }] });
    }

    const embed = new MessageEmbed()
      .setColor('#58809A')
      .setAuthor({ name: 'Urban Dictionary', iconUrl: 'https://i.imgur.com/VFXr0ID.jpg' })
      .setTitle(res.word)
      .setURL(res.urbanURL)
      .setDescription(res.definition.replace(/([\[\]])/g, ''))
      .addFields({ name: 'Example', value: res.example.replace(/([\[\]])/g, '') || 'None' })
      .addFields({ name: ':+1:', value: `${res.thumbsUp}`}, true)
      .addFields({ name: ':-1:', value: `${res.thumbsDown}`}, true)
      .setFooter({ text: `Posted by ${res.author}` });

    return reply(message, { embeds: [embed] })
  }
}