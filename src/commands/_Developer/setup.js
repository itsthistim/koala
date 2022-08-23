const { Command, CommandOptionsRunTypeEnum, BucketScope } = require("@sapphire/framework");
const { send, reply } = require("@sapphire/plugin-editable-commands");
const { MessageEmbed } = require("discord.js");
const { Time } = require("@sapphire/time-utilities");

module.exports = class SyncCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: "setup",
      aliases: ["setup", "sync"],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ["ownerOnly"],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: "Sets up the server.",
        usage: "[mute] [bot] [sync]",
        examples: [""],
      },
      detailedDescription: '\nSets up the server.\n\n**Mute**: Takes a role and sets all channels to have that role. Also denies permissions to communicate with other members. They can still join voice channels but not talk in them.\n\n**Bot**: Takes a role and attempts to assign all bots to this role.\n\n**Sync**: Syncs permissions with the parent channel.',
    });
  }

  async messageRun(message, args) {
    message.delete().catch(() => { });

    var action = await args.pick("string").catch(() => null);

    let channels = message.guild.channels.cache;

    switch (action) {
      case "mute":
        var muterole = await args.pick("role").catch(() => null);
        if (!muterole) return reply(message, "No muterole specified.");


        channels.forEach((channel) => {
          channel.permissionOverwrites.create(muterole, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false,
            CREATE_PUBLIC_THREADS: false,
            CREATE_PRIVATE_THREADS: false,
            SEND_MESSAGES_IN_THREADS: false,
            CHANGE_NICKNAME: false
          });
        });
        break;
      case "sync":
        channels.forEach((channel) => {
          if (channel.parent) {
            channel.lockPermissions().catch(console.error);
          }
        });
        break;
      case "bot":
        var botrole = await args.pick("role").catch(() => null);
        if (!botrole) return reply(message, "No botrole specified.");

        message.guild.members.cache.forEach((member) => {
          if (member.user.bot) {
            member.roles.add(botrole).catch(() => { });
          }
        });
        break;
      case "everyone":
        // remove CREATE_INSTANT_INVITE and MANAGE_CHANNELS from everyone
        message.guild.roles.cache.forEach((role) => {
          role.permissions.remove([
            "CREATE_PUBLIC_THREADS",
            "CREATE_PRIVATE_THREADS",
            "MENTION_EVERYONE"
          ]).catch(() => { });
        }).catch(() => { });
        break;
      default:
        message.channel.send("Please specify a valid action.");
        break;
    }
  }
};