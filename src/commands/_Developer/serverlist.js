const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const { table } = require('table');
const PasteGG = require("paste.gg");
const moment = require('moment');

module.exports = class ServerListCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'serverlist',
      aliases: ['serverlist', 'server-list', 'slist', 's-list'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Lists servers the bot is in.',
        usage: '',
        examples: ['']
      }
    });
  }

  async messageRun(message, args) {
    let xa = this.container.client.users.cache.get('319183644331606016');
    const data = [
      ["Name", "ID", "Owner", "Members", "Bots", "Total", "Created", "Invite"]
    ];

    this.container.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).forEach(guild => {
      data.push([
        guild.name,
        guild.id,
        this.container.client.users.cache.get(guild.ownerId).tag,
        guild.members.cache.filter(m => !m.user.bot).size,
        guild.members.cache.filter(m => m.user.bot).size,
        guild.memberCount,
        moment(guild.createdTimestamp).format('MMMM Do YYYY, h:mm:ss a') + ` (${moment(guild.createdTimestamp).fromNow()})`,
        // TODO: fix invites
        guild.invites.fetch().then(function(invites) {
          if (invites.size > 0) {
            return invites.first().url;
          } else {
            return "No Invite";
          }
        })
      ]);
    });

    return xa.send(await this.getPaste(table(data), 'guilds'));
  }

  async getPaste(content, title) {
    try {
      const client = new PasteGG();
      let paste = await client.post({
        name: title,
        expires: new Date(Date.now() + Time.Minute * 2),
        description: title,
        files: [{
          name: `${title}.js`,
          content: {
            format: 'text',
            highlight_language: 'javascript',
            value: content
          }
        }]
      })

      return `\n${paste?.result?.url}`
    } catch (err) {
      return `\n${err}`;
    }
  }
}