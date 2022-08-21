const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command } = require('@sapphire/framework');
const { UserOrMemberMentionRegex } = require('@sapphire/discord-utilities');
const { createCanvas, loadImage, registerFont } = require('canvas');
const moment = require('moment');
const clientUtil = require('../../utils/clientutil');
const path = require('path');

module.exports = class CertificateCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'certificate',
      aliases: ['certificate', 'certify'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Send a custom award to anyone.',
        usage: '<name> <reason>'
      }
    });
  }

  async messageRun(message, args) {
    let name = await args.pick('string').catch(() => args.pick('member').catch(() => message.author));
    let reason = await args.pick('string').catch(() => "");

    try {
      if (name.match(UserOrMemberMentionRegex)) {
        name = clientUtil.resolveMember(name, message.guild.members.cache).nickname || clientUtil.resolveMember(name, message.guild.members.cache).user.username;
      }

      registerFont(path.join(__dirname, '..', '..', 'utils', 'assets', 'fonts', 'OLD.ttf'), { family: 'Old English Text MT' });
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'certificate.png'));

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(base, 0, 0);
      ctx.font = '30px Old English Text MT';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillText(reason, 518, 273);
      ctx.fillText(name, 518, 419);
      ctx.fillText(moment().format('MM/DD/YYYY'), 309, 503);
      return reply( message, { files: [{ attachment: canvas.toBuffer(), name: 'certificate.png' }] });
    } catch (error) {
      return reply( message, `Something went wrong... \`${error.message}\``);
    }
  }
}