const {
  Command,
  CommandOptionsRunTypeEnum,
  BucketScope,
} = require("@sapphire/framework");
const { send, reply } = require("@sapphire/plugin-editable-commands");
const { Time } = require("@sapphire/time-utilities");
const { PaginatedMessage } = require("@sapphire/discord.js-utilities");
const { MessageEmbed } = require("discord.js");
const { get } = require("snekfetch");

module.exports = class DadJokeCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "dadjoke",
      aliases: ["dadjoke", "dad", "joke"],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: "Sends a random dad joke",
        usage: "",
        examples: [""],
      },
      detailedDescription: "",
    });
  }

  async messageRun(message, args) {
    const { body } = await get("https://icanhazdadjoke.com/")
      .set("Accept", "application/json")
      .catch((e) => {
        Error.captureStackTrace(e);
        return e;
      });

    const desc = body.joke && body.joke.length < 1900 ? body.joke : `${body.joke.substring(0, 1900)}...`;
    
    const embed = new MessageEmbed()
      .setAuthor({
        name: "Dad says:",
        iconURL: "https://alekeagle.com/assets/dad.518f1968.png",
      })
      .setDescription(`${desc}`)
      .setColor("RANDOM");
    return reply(message, { embeds: [embed] });
  }
};
