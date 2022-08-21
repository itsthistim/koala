const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { wrapText } = require('../../utils/canvas.js');
const path = require('path');
//registerFont(path.join(__dirname, '..', '..', 'utils', 'assets', 'fonts', 'MinecraftRegular-Bmg3.otf'), { family: 'Minecraftia' });

class GandhiQuoteCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'gandhi-quote',
      aliases: ['gandhi-quote', 'gandhiquote', 'gandhi', 'ghandi-quote', 'ghandiquote', 'ghandi'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Will make Mahatma Gandhi say what you want.',
        usage: '<text>'
      }
    });
  }

  async messageRun(message, args) {
    const quote = await args.rest('string').catch(() => "Nothing to say there is.");

    registerFont(path.join(__dirname, '../../utils/assets/fonts/LibreBaskerville-Italic.ttf'), { family: 'Libre Baskerville Italic' });

    const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'gandhi-quote.png'));
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(base, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '50px Libre Baskerville Italic';
    ctx.fillStyle = 'white';

    let fontSize = 50;

    while (ctx.measureText(quote).width > 945) {
      fontSize--;
      ctx.font = `${fontSize}px Libre Baskerville Italic`;
    }

    const lines = await wrapText(ctx, quote, 270);
    const topMost = 180 - (((fontSize * lines.length) / 2) + ((20 * (lines.length - 1)) / 2));

    for (let i = 0; i < lines.length; i++) {
      const height = topMost + ((fontSize + 20) * i);
      ctx.fillText(lines[i], 395, height);
    }

    return reply(message, { files: [{ attachment: canvas.toBuffer(), name: 'gandhi-quote.png' }] });
  }
}

module.exports = {
  GandhiQuoteCommand
};

