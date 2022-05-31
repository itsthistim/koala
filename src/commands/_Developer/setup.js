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

    var action = await args.pick("string").catch(() => null);
    var muterole = await args.pick("role").catch(() => null);

    if (!action) return reply(message, "No action specified.");
    if (action != "mute" && action != "sync") return reply(message, "Invalid action.");

    if (action == "mute") {
      if (!muterole) return reply(message, "No muterole specified.");

      // set mute role permissions for all channels
      // let muterole = message.guild.roles.cache.find(
      //   (role) => role.name === "muted"
      // );

      let channels = message.guild.channels.cache;
      channels.forEach((channel) => {
        channel.permissionOverwrites.create(muterole, {
          SEND_MESSAGES: false,
          SPEAK: false,
          ADD_REACTIONS: false,
        });
      });
    }

    if (action == "sync") {
      // sync permissions with parent
      channels.forEach((channel) => {
        if (channel.parent) {
          channel.lockPermissions().catch(console.error);
        }
      });
    }
  }
};