const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class BobRossCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'bob-ross',
      aliases: ['bobross', 'ross'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Will make Bob Ross paint a picture.',
        usage: '<imageUrl | member>',
        examples: ['', 'https://i.imgur.com/w3DaR07.png', '@User#1234']
      }
    });
  }

  async messageRun(message, args) {
    let image = await args.pick('member').catch(() => args.pick('image').catch(() => message.author.displayAvatarURL({ format: 'png', size: 512 })));
    if (typeof image === 'object') {
      image = image.displayAvatarURL({ format: 'png', size: 512 });
    }

    try {
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'bob-ross.png'));
      const avatar = await loadImage(image);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f0e8d3';
      ctx.fillRect(0, 0, base.width, base.height);
      ctx.drawImage(avatar, 15, 23, 440, 440);
      ctx.drawImage(base, 0, 0);
      return reply(message, { files: [{ attachment: canvas.toBuffer(), name: 'bob-ross.png' }] });
    } catch (error) {
      return reply(message, `Something went wrong... \`${error.message}\``);
    }
  }
}