const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');

module.exports = class DiscriminatorCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'discriminator',
      aliases: ['discriminator', 'discrim'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Searches for users using a given discriminator.',
        usage: '[discriminator]',
        examples: ['', '0001']
      }
    });
  }

  async messageRun(message, args) {
    const discriminator = await args.pick('string').catch(() => message.author.discriminator);
    let users = this.container.client.users.cache;
    let matches = [];

    users.forEach(element => {
      if (element.discriminator === discriminator) {
        matches.push(`${element.username}#${element.discriminator}`);
      }
    });

    if (matches.length === 0) {
      reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} No users found with discriminator ${discriminator}.`, color: COLORS.RED }] });
    } else {
      let result = "```" + matches.join("\n") + "```";

      reply(message, result + `Sample size: ${users.size}`);
      // reply(message, { embeds: [{ description: result, footer: {text: `Sample size: ${users.size}`}, color: COLORS.DEFAULT }] });
    }
  }
}