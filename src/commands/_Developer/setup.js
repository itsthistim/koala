const {Command, CommandOptionsRunTypeEnum, BucketScope} = require("@sapphire/framework");
const { send, reply } = require("@sapphire/plugin-editable-commands");
const { MessageEmbed } = require("discord.js");
const { Time } = require("@sapphire/time-utilities");

module.exports = class SyncCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
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
        usage: "[mute] [sync]",
        examples: [""],
      },
    });
  }

  async messageRun(message, args) {
    message.delete().catch(() => {});

    var actions = await args.repeat("string").catch(() => null);

    if (!actions) return reply(message, "No actions specified.");

    var mute = actions.includes("mute") || actions.includes("muted") || actions.includes("mutes");
    var sync = actions.includes("sync");

    if (!mute && !sync) return reply(message, "No actions specified.");

    if (mute) {
      // set mute role permissions for all channels
      let muterole = message.guild.roles.cache.find(
        (role) => role.name === "Muted"
      );

      let channels = message.guild.channels.cache;
      channels.forEach((channel) => {
        channel.permissionOverwrites.create(muterole, {
          SEND_MESSAGES: false,
          SPEAK: false,
          ADD_REACTIONS: false,
        });
      });
    }

    if (sync) {
      // sync permissions with parent
      channels.forEach((channel) => {
        if (channel.parent) {
          channel.lockPermissions().catch(console.error);
        }
      });
    }
  }
};