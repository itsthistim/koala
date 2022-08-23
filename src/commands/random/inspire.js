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

module.exports = class InspireCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: "inspire",
      aliases: ["inspire"],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: "Provides an inspirational quote for you.",
        usage: "",
        examples: [""],
      },
      detailedDescription: "",
    });
  }

  async messageRun(msg, args) {
    let quote = await this.getQuote();
    let embed = new MessageEmbed();
    embed.setColor(`RANDOM`);
    embed.setTitle(`Inspirational quote`);
    embed.setURL(quote);
    embed.setImage(quote);
    embed.setFooter({text: `Powered by https://inspirobot.me/`});

    reply(msg,{ embeds: [embed] });
  }

  async getQuote() {
    const res = await get(`https://inspirobot.me/api?generate=true`);
    return res.data;
  }
};
