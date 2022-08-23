const {
  Command,
  CommandOptionsRunTypeEnum,
  BucketScope,
} = require("@sapphire/framework");
const { send, reply } = require("@sapphire/plugin-editable-commands");
const { MessageEmbed } = require("discord.js");
const { Time } = require("@sapphire/time-utilities");

module.exports = class PurgeCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: "purge",
      aliases: ["purge", "prune", "clear", "clean", "delete"],
      requiredUserPermissions: ["MANAGE_MESSAGES"],
      requiredClientPermissions: ["MANAGE_MESSAGES"],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: "Purge messages from the current channel.",
        usage: "<amount>",
        examples: ["10"],
      },
      detailedDescription: "\n",
    });
  }

  async messageRun(message, args) {
    var amount = await args.pick("integer").catch(() => 0);

    if (amount > 1000) {
      return reply(
        message,
        "You can only delete up to 1000 messages at a time."
      );
    }

    amount++; // include the message that triggered the command
    var deleted = 0; // number of messages deleted
    var deletedTotal = 0; // total number of messages deleted

    // keep deleting messages in 100 message chunks until a deletable amount of messages is reached
    while (amount > 100) {
      deleted = await message.channel.bulkDelete(
        (
          await message.channel.messages.fetch({ limit: 100 })
        ).filter((message) => !message.pinned && message.deletable),
        true
      );
      deletedTotal += deleted.size;
      amount -= deleted.size; // TODO: potentially have to rewrite to subtract 100 to prevent possible infinite loops
    }

    // delete the remaining messages
    if (amount > 0) {
      deleted = await message.channel.bulkDelete(
        (
          await message.channel.messages.fetch({ limit: amount })
        ).filter((message) => !message.pinned && message.deletable),
        true
      );
      deletedTotal += deleted.size;
    }

    // send response which deletes itself after 5 seconds
    deletedTotal--; // remove the message that triggered the command from count
    let response = await send(message, `Deleted ${deletedTotal} messages.`);
    setTimeout(() => {
      response.delete();
    }, 3 * Time.Second);
  }
};
