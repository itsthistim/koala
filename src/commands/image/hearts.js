const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { drawImageWithTint, shortenText } = require('../../utils/canvas.js');
const path = require('path');

module.exports = class HeartsCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'hearts',
      aliases: ['hearts', 'heart'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Will draw hearts over a members profile picture or image.',
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
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'hearts.png'));
      const avatar = await loadImage(image);

      const canvas = createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext('2d');
      drawImageWithTint(ctx, avatar, 'deeppink', 0, 0, avatar.width, avatar.height);
      ctx.drawImage(base, 0, 0, avatar.width, avatar.height);
      return reply( message, { files: [{ attachment: canvas.toBuffer(), name: 'hearts.png' }] });

    } catch (err) {
      return reply( message, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
}