const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const urban = require('relevant-urban');

module.exports = class UrbanCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'urban',
      aliases: ['urban'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: 'Looks up anything on urbandictionary.com.'
    });
  }

  async messageRun(message, args) {
    const term = await args.rest('string').catch(() => '');

    if(!term) {
      return reply(message, "You didn't provide a term to look for.")
    }

    try {
      var res = await urban(term);
    } catch (error) {
      const errembed = new MessageEmbed()
        .setColor(COLORS[2])
        .setDescription(`:x: Nothing found!`);
      return reply(message, { embeds: [errembed] });
    }

    const embed = new MessageEmbed()
      .setColor(COLORS[0])
      .setAuthor({ name: 'Urban Dictionary', iconUrl: 'https://i.imgur.com//VFXr0ID.jpg' })
      .setTitle(res.word)
      .setURL(res.urbanURL)
      .setDescription(res.definition.replace(/([\[\]])/g, ''))
      .addField('Example', res.example.replace(/([\[\]])/g, '') || 'None')
      .addField(':+1:', `${res.thumbsUp}`, true)
      .addField(':-1:', `${res.thumbsDown}`, true)
      .setFooter({ text: `Posted by ${res.author}` });

    return reply(message, { embeds: [embed] })
  }
}