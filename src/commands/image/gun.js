const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class GunCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'gun',
      aliases: ['gun'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Will make anyone hold a gun.',
        usage: '<image url | member>'
      }
    });
  }

  async messageRun(message, args) {
    let image = await args.pick('member').catch(() => args.pick('image').catch(() => message.author.displayAvatarURL({ format: 'png', size: 512 })));
    if (typeof image === 'object') {
      image = image.displayAvatarURL({ format: 'png', size: 512 });
    }

    try {
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'gun.png'));
      const data = await loadImage(image);

      const canvas = createCanvas(data.width, data.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(data, 0, 0);
      const ratio = (data.height / 2) / base.height;
      const width = base.width * ratio;
      ctx.drawImage(base, data.width - width, data.height - (data.height / 2), width, data.height / 2);
      const attachment = canvas.toBuffer();
      if (Buffer.byteLength(attachment) > 8e+6) return reply(message, 'Resulting image was above 8 MB.');
      return reply(message, { files: [{ attachment, name: 'gun.png' }] });
    } catch (err) {
      return reply(message, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
}