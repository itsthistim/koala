const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

module.exports = class BeautifulCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'beautiful',
      aliases: ['beautiful', 'bf'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Gravity Falls\' "Oh, this? This is beautiful." meme.',
        usage: '<imageUrl | member>'
      },
    });
  }

  async messageRun(message, args) {
    let image = await args.pick('member').catch(() => args.pick('image').catch(() => message.author.displayAvatarURL({ format: 'png', size: 512 })));
    if (typeof image === 'object') {
      image = image.displayAvatarURL({ format: 'png', size: 512 });
    }

    try {
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'beautiful.png'));
      const data = await loadImage(image);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, base.width, base.height);
      ctx.drawImage(data, 249, 24, 105, 105);
      ctx.drawImage(data, 249, 223, 105, 105);
      ctx.drawImage(base, 0, 0);
      return reply(message, { files: [{ attachment: canvas.toBuffer(), name: 'beautiful.png' }] });
    } catch (err) {
      return reply(message, `Oh no, an error occurred: \`${err.message}\`.`);
    }
  }

  // static imageOrMember = Args.make((parameter, { argument }) => {
  //   if (Number(parameter) || !isNullishOrEmpty(parameter)) {
  //     return Args.ok(parameter);
  //   }

  //   return Args.error({
  //     argument,
  //     parameter,
  //     identifier: 'ImageOrMemberError',
  //     message: 'The provided argument was neither an image nor a member.'
  //   });
  //  });

  /**
  * Validates a parameter.
  * @param parameter The given parameter by the user.
  * @returns Whether the parameter should be accepted.
  */
  // static imageOrMember = Args.make((parameter, { argument }) => {
  //   parameter = parameter.replace('<', '');
  //   parameter = parameter.replace('>', '');


  //   if (this.validURL(parameter) && allowedFileTypes.test(parameter.toLowerCase())) {
  //     return Args.ok(parameter);
  //   }

  //   if (Resolvers.resolveMember(parameter, '502208815937224715')) {
  //     return Args.ok(parameter);
  //   }

  //   return Args.error({
  //     argument,
  //     parameter,
  //     identifier: 'ImageOrMemberError',
  //     message: 'The provided argument was neither an image url nor a member.'
  //   });
  // });

  /**
  * Checks if a string is a valid url.
  * @param str The string to check.
  * @returns Whether the string is valid or not.
  */
}