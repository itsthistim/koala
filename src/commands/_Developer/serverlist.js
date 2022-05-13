const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
// const { table } = require('table');
let table = require("table");
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

    // create table
    const data = [
      ["Name", "ID", "Owner", "Members", "Bots", "Total", "Created", "Invite"]
    ];

    // for each guild sorted by total membercount add the values to the corresponding row
    this.container.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).forEach(guild => {
      data.push([
        guild.name,
        guild.id,
        this.container.client.users.cache.get(guild.ownerId).tag,
        guild.members.cache.filter(m => !m.user.bot).size,
        guild.members.cache.filter(m => m.user.bot).size,
        guild.memberCount,
        moment(guild.createdTimestamp).format('MMMM Do YYYY, h:mm:ss a') + ` (${moment(guild.createdTimestamp).fromNow()})`,
        this.getFirstInvite(guild)
      ]);
    });

    let config = {
      border: table.getBorderCharacters("ramac"),
    }

    let list = table.table(data, config);
    return xa.send(await this.getPaste(list, 'guilds'));
  }


  async getFirstInvite(guild) {
    let invite = await guild.invites.fetch();
    if (invite.size > 0) {
      return invite.first().code;
    } else {
      return "No Invite";
    }
  }

  async getPaste(content, title) {
    try {
      const client = new PasteGG();
      let paste = await client.post({
        name: title,
        expires: new Date(Date.now() + Time.Minute * 2),
        description: title,
        files: [{
          name: `${title}.txt`,
          content: {
            format: 'text',
            highlight_language: null,
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