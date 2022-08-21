const {
  Command,
  CommandOptionsRunTypeEnum,
  BucketScope,
} = require("@sapphire/framework");
const { send, reply } = require("@sapphire/plugin-editable-commands");
const { Time } = require("@sapphire/time-utilities");
const { PaginatedMessage } = require("@sapphire/discord.js-utilities");
const { MessageEmbed } = require("discord.js");
const { get } = require("axios");

module.exports = class InsultCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: "insult",
      aliases: ["insult"],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: ["tts"],
      options: [],
      nsfw: false,
      description: {
        content: "Sends a random insult! (Can also insult members)",
        usage: "[member]",
        examples: ["@user", ""],
      },
      detailedDescription: "",
    });
  }

  async messageRun(message, args) {
    var user = await args.pick("member").catch(() => null);
    var tts = args.getFlags("tts");

    message.delete({ timeout: 5000 });

    get("https://insult.mattbas.org/api/insult").then((res) => {
      let text = res.data.replace(/[\r\n]/gm, '');
      

      if (user) {
        // make first letter lowercase
        text = text.charAt(0).toLowerCase() + text.substring(1);
        
        // send tts message
        if (tts) {
            return send(message, `<@${user.id}>, ${text}.`, { tts: true });
        } else {
            return send(message, `<@${user.id}>, ${text}.`);
        }
      } else {
        return send(message, `${text}.`);
      }
    });
  }
};
