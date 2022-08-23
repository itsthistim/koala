const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class RainbowCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'rainbow',
      aliases: ['rainbow', 'gay'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows a members profile picture or an image behind a rainbow.',
        usage: '<imageUrl | member>'
      }
    });
  }

  async messageRun(message, args) {
    let image = await args.pick('member').catch(() => args.pick('image').catch(() => message.author.displayAvatarURL({ format: 'png', size: 512 })));
    if (typeof image === 'object') {
      image = image.displayAvatarURL({ format: 'png', size: 512 });
    }

    try {
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'rainbow.png'));
      const data = await loadImage(image);

      const canvas = createCanvas(data.width, data.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(data, 0, 0);
      ctx.drawImage(base, 0, 0, data.width, data.height);
      const attachment = canvas.toBuffer();
      if (Buffer.byteLength(attachment) > 8e+6) return reply(message, 'Resulting image was above 8 MB.');
      return reply(message, { files: [{ attachment, name: 'rainbow.png' }] });
    } catch (err) {
      return reply(message, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
}