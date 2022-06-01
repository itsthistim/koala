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
      ...options,
      name: "purge",
      aliases: ["purge", "prune", "clear", "clean", "delete"],
      requiredUserPermissions: ["MANAGE_MESSAGES"],
      requiredClientPermissions: ["MANAGE_MESSAGES"],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: "Deletes messages except for pinned ones.",
    });
  }

  async messageRun(message, args) {
    var amount = await args.pick("integer").catch(() => 0);
    amount++; // include the message that triggered the command
    var deleted = 0; // number of messages deleted
    var deletedTotal = 0; // total number of messages deleted

    // keep deleting messages in 100 message chunks until a deletable amount of messages is reached
    while (amount > 100) {
      deleted = await message.channel.bulkDelete((await message.channel.messages.fetch({limit: 100})).filter(message => !message.pinned && message.deletable), true);
      deletedTotal += deleted;
      amount -= deleted;
    }

    // delete the remaining messages
    if (amount > 0) {
      deletedTotal += await message.channel.bulkDelete((await message.channel.messages.fetch({limit: amount})).filter(message => !message.pinned && message.deletable), true);
    }

    // send the response and delete it after 5 seconds
    // let response = await message.channel.send(`Deleted ${deletedTotal} messages.`);
    // response.delete({ timeout: 10000 });

    // message.delete().catch(() => { });

    // let leftToDelete;
    // let deletable = 0;
    // const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    // (async (delay) => {
    //   let del = true;
    //   while (del) {
    //     await wait(delay);
    //     deletable = parseInt(deletable + 100); // amount of msgs it can delete
    //     leftToDelete = parseInt((amount - deletable) + 100); // subtract the msgs it can delete from input and add 100 to delete correct amount

    //     if (leftToDelete > 100) {
    //       const fetch = await message.channel.messages.fetch(filter, { limit: 100 })
    //       let filter = fetchedMessages.filter(msg => msg.createdTimestamp < 1209600000)
    //       let deletedAmount = await message.channel.bulkDelete(fetch);
    //       let delmsg1 = await message.channel.send(`Deleted ${deletedAmount} messages.`);
    //       await wait(5 * Time.Second);
    //       delmsg1.delete().catch(() => { });
    //     } else {
    //       const fetch = await message.channel.messages.fetch({
    //         limit: leftToDelete
    //       })
    //       let deletedAmount = await message.channel.bulkDelete(fetch)
    //       let delmsg2 = await message.channel.send(`Deleted ${deletedAmount.size} messages.`);
    //       del = false;
    //       await wait(5  * Time.Second);
    //       delmsg2.delete().catch(() => { });
    //     }
    //   }
    // })(2 * Time.Second)
  }
};
