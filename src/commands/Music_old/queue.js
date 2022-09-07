const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');

module.exports = class QueueCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'queue',
      aliases: ['queue', 'q'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows the current queue.',
        usage: '[clear]',
        examples: ['', 'clear']
      },
      detailedDescription: '\`clear\` - Clears the queue.'
    });
  }

  async messageRun(message, args) {
    var action = await args.rest('string').catch(() => 'show');

    switch (action) {
      case 'clear':
        return this.clear(message);
        break;
      default:
        return this.show(message);
        break;
    }
  }

  async show(message) {
    const queue = PLAYER.getQueue(message.guild);
    if (!queue) {
      const embed = new MessageEmbed();
      embed.setTitle('Server Queue');
      embed.setColor(COLORS.RED);
      embed.setDescription(`There is no songs in the queue!`);
      return reply(message, { embeds: [embed] });
    }

    // const myPaginatedMessage = new PaginatedMessage({
    //   template: new MessageEmbed()
    //     .setColor(COLORS.DEFAULT)
    //     .setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() })
    // });

    // myPaginatedMessage.addPageEmbed((embed) => {

    //   embed.setTitle('Help');
    //   embed.setDescription(`Use \`${prefix}help [command]\` to get more information about a command.`);
    //   embed.setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() });

    //   return embed;
    // });

    // for (const category of categories) {
    //   const categoryCommands = commands.filter(c => c.category === category);

    //   if (category != '_Developer') {
    //     myPaginatedMessage.addPageEmbed((embed) => {
    //       embed.setTitle(category);
    //       embed.setDescription(`${categoryCommands.map(c => {
    //         return `\`${prefix}${c.name}\` - ${c.description.content}`;
    //       }).join('\n')}`);

    //       embed.setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() });

    //       return embed;
    //     });
    //   }
    // }

    // await myPaginatedMessage.run(message);



    const pages = [];
    let page = 1;
    let emptypage = false;

    do {
      const pageStart = 10 * (page - 1);
      const pageEnd = pageStart + 10;

      const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
        return `**${i + pageStart + 1}**. [${m.title}](${m.url}) ${m.duration} - ${m.requestedBy}`;
      });

      // if there is tracks left, add a page
      if (tracks.length) {
        const embed = new MessageEmbed();

        embed.setDescription(`${tracks.join('\n')}${queue.tracks.length > pageEnd ? `\n... ${queue.tracks.length - pageEnd} more track(s)` : ''}`);

        if (page % 2 === 0) {
          embed.setColor(COLORS.RED);
        }
        else {
          embed.setColor(COLORS.GREEN);
        }

        if (page === 1) {
          embed.setAuthor({ name: `Now playing: ${queue.current.title}`, iconURL: null, url: `${queue.current.url}` });
        }

        pages.push(embed);
        page++;
      }
      else {
        emptypage = 1;
        if (page === 1) {
          const embed = new MessageEmbed();
          embed.setColor(COLORS.GREEN);
          embed.setDescription(`There is no songs in the queue!`);
          embed.setAuthor({ name: `Now playing: ${queue.current.title}`, iconURL: null, url: `${queue.current.url}` });
          return reply(message, { embeds: [embed] });
        }
        if (page === 2) {
          return reply(message, { embeds: [pages[0]] });
        }
      }
    } while (!emptypage);

    return paginationEmbed(message, pages, 30000);
  }

  async clear(message) {
    message.guild.me.voice.disconnect().catch(() => { });
    const queue = PLAYER.getQueue(message.guild);
    if (queue) {
      queue.destroy(true);
      reply(message, 'Queue cleared!');
    } else {
      reply(message, 'There is no queue to clear!');
    }
  }
}