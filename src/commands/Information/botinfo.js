const { Command, CommandOptionsRunTypeEnum, BucketScope, version: sappVersion } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed, version: djsVersion } = require('discord.js');

module.exports = class BotInfoCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'about',
      aliases: ['botinfo', 'bot-info', 'stats', 'statistics', 'about', 'info'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: ['uptime'],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows some information about the bot.',
        usage: '[--uptime]',
        examples: ['', '--uptime']
      }
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) => {
      builder.setName(this.name)
      builder.setDescription(this.description.content)
    }, {
      idHints: '995355165873934418'
    })
  }

  async chatInputRun(interaction) {
    const dev = this.container.client.users.cache.get('319183644331606016');

    const embed = new MessageEmbed()
      .setColor(global.COLORS.DEFAULT)
      .setTitle('Statistics')
      .addFields({ name: 'Technical', value: `**Uptime**: ${this.formatMilliseconds(this.container.client.uptime)}\n**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n**Discord.js**: v${djsVersion}\n**Sapphire**: v${sappVersion}` }, true)
      .addFields({ name: 'Discord', value: `**Guilds**: ${this.container.client.guilds.cache.size}\n**Channels**: ${this.container.client.channels.cache.size}\n**Users**: ${this.container.client.users.cache.size}` }, true)
      .setFooter({ text: `Created by ${dev.tag}`, iconURL: dev.displayAvatarURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: false,
      fetchReply: true,
    })
  }

  async messageRun(message, args) {
    const dev = this.container.client.users.cache.get('319183644331606016');

    if (args.getFlags('uptime')) {
      return reply(message, this.formatMilliseconds(this.container.client.uptime));

    } else {
      const embed = new MessageEmbed()
        .setColor(global.COLORS.DEFAULT)
        .setTitle('Statistics')
        .addFields({ name: 'Technical', value: `**Uptime**: ${this.formatMilliseconds(this.container.client.uptime)}\n**Memory**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n**Discord.js**: v${djsVersion}\n**Sapphire**: v${sappVersion}` }, true)
        .addFields({ name: 'Discord', value: `**Guilds**: ${this.container.client.guilds.cache.size}\n**Channels**: ${this.container.client.channels.cache.size}\n**Users**: ${this.container.client.users.cache.size}`}, true)
        .setFooter({ text: `Created by ${dev.tag}`, iconURL: dev.displayAvatarURL() });

      return reply(message, { embeds: [embed] });
    }
  }

  formatMilliseconds(ms) {
    let x = Math.floor(ms / 1000);
    let seconds = x % 60;

    x = Math.floor(x / 60);
    let minutes = x % 60;

    x = Math.floor(x / 60);
    let hours = x % 24;

    let days = Math.floor(x / 24);

    seconds = `${'0'.repeat(2 - seconds.toString().length)}${seconds}`;
    minutes = `${'0'.repeat(2 - minutes.toString().length)}${minutes}`;
    hours = `${'0'.repeat(2 - hours.toString().length)}${hours}`;
    days = `${'0'.repeat(Math.max(0, 2 - days.toString().length))}${days}`;

    return `${days === '00' ? '' : `${days}:`}${hours}:${minutes}:${seconds}`;
  }
}