const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { shortenText, drawImageWithTint } = require('../../utils/canvas.js');
const path = require('path');
registerFont(path.join(__dirname, '..', '..', 'utils', 'assets', 'fonts', 'MinecraftRegular-Bmg3.otf'), { family: 'Minecraftia' });

class AchievementCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'advancement',
      aliases: ['advancement', 'minecraft', 'achievement', 'minecraft-achievement', 'minecraftachievement'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Send a minecraft advancement with any text.',
        usage: '[text]'
      }
    });
  }

  async messageRun(msg, args) {
    const text = await args.rest('string').catch(() => `Invite ${this.container.client.user.username}`);

    try {
      const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'achievement.png'));
      const canvas = createCanvas(base.width, base.height);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(base, 0, 0);
      ctx.font = '20px Minecraftia';
      ctx.fillStyle = '#ffff00';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(shortenText(ctx, text, 250), 60, 50);
      return reply(msg, { files: [{ attachment: canvas.toBuffer(), name: 'achievement.png' }] });
    } catch (error) {
      return reply(msg, `Something went wrong... \`${error.message}\``);
    }
  }
}

module.exports = {
  AchievementCommand
};

