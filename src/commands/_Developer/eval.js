const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { codeBlock, isThenable, regExpEsc } = require('@sapphire/utilities');
const { Time } = require('@sapphire/time-utilities');
const util = require("util");
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Stopwatch } = require('@sapphire/stopwatch');
const { fetch, FetchResultTypes, FetchMethods } = require('@sapphire/fetch');
const PasteGG = require("paste.gg");
const { inspect } = require("node:util");

module.exports = class EvalCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'eval',
      aliases: ['eval', 'e', 'ev'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: ['async'],
      options: [],
      quotes: [],
      nsfw: false,
      description: {
        content: 'Evaluates code.',
        usage: '<code> [--async]',
        examples: ['message.channel.send("Hello World") --json']
      }
    });
  }

  async messageRun(message, args) {
    let code = await args.rest('string');
    const { success, result, time, thenable } = await this.eval(code, message, args.getFlags('async'));

    if (success) {
      if (thenable) {
        return result;
      }
    }

    return reply(message, `${result.length > 2000 ? await this.getPaste(result, code).catch((err) => codeBlock(err)) : codeBlock('js', result)}\n${time}`);
  }

  async eval(code, message, async) {
    let success;
    let syncTime;
    let asyncTime;
    let result;
    let thenable = false;

    const stopwatch = new Stopwatch();
    try {
      if (async) code = `(async () => {\n${code}\n})();`;

      result = eval(code);
      syncTime = stopwatch.toString();

      if (isThenable(result)) {
        thenable = true;
        stopwatch.restart();
        result = await result;
        asyncTime = stopwatch.toString();
      }

      success = true;
    } catch (error) {
      if (!syncTime) syncTime = stopwatch.toString();
      if (thenable && !asyncTime) asyncTime = stopwatch.toString();
      result = error.toString();
      success = false;
    }

    stopwatch.stop();
    if (typeof result !== 'string') {
      result = result instanceof Error ? result.stack : inspect(result, { depth: 0 });
    }

    return { success, time: this.formatTime(syncTime, asyncTime ?? ''), result: this.clean(result), thenable };
  }

  formatTime(syncTime, asyncTime) {
    return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
  }

  clean(text) {
    let token = [process.env.DISCORD_TOKEN];
    let sensitivePattern = new RegExp(token.map(regExpEsc).join('|'), 'gi');

    const zws = String.fromCharCode(8203)
    return text.replace(sensitivePattern, '「ｒｅｄａｃｔｅｄ」').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
  }

  async getPaste(value, desc) {
    try {
      const client = new PasteGG();
      let paste = await client.post({
        name: 'eval',
        expires: new Date(Date.now() + Time.Minute * 2),
        description: desc,
        files: [{
          name: 'eval.js',
          content: {
            format: 'text',
            highlight_language: 'javascript',
            value: value
          }
        }]
      })

      return `\n${paste.result.url}`
    } catch (err) {
      return `\n${err}`;
    }
  }
}