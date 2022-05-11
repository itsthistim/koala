const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const { hyperlink, hideLinkEmbed } = require('@discordjs/builders');

module.exports = class InviteCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'invite',
      aliases: ['invite'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Gives you the invite link for the bot.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const embed = new MessageEmbed()
      .setColor(COLORS.DEFAULT)
      .setTitle("Invite Link")
      .setDescription(`[Add me to your server!](${await this.fetchInvite()})`);
    return reply(message, { embeds: [embed] });
  }

  async fetchInvite() {
    if (this.invite) return this.invite;
    const invite = this.container.client.generateInvite({
      scopes: ['bot'], permissions: [
        'ADMINISTRATOR',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'READ_MESSAGE_HISTORY',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'ADD_REACTIONS',
        'CREATE_INSTANT_INVITE',
        'VIEW_AUDIT_LOG',
        'SEND_TTS_MESSAGES',
        'MANAGE_WEBHOOKS'
      ]
    });

    this.invite = invite;
    return invite;
  }
}