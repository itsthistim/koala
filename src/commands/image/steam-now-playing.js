const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Command, Args, Resolvers, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { shortenText, drawImageWithTint  } = require('../../utils/canvas.js');
const path = require('path');

module.exports = class SteamPlayingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'steam-now-playing',
      aliases: ['steam-now-playing', 'steamnowplaying', 'steamplaying', 'steam-playing', 'steamplay', 'steam-playing', 'steam', 'game', 'steam-game', 'steamgame'],
      requiredUserPermissions: [],
      requiredClientPermissions: ['ATTACH_FILES'],
      preconditions: [],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Shows a member play anything via Steam.',
        usage: '<imageUrl | member>'
      }
    });
  }

  async messageRun(message, args) {
    const guildMember = await args.pick('member').catch(() => message.guild.members.cache.get(message.author.id));
    const game = await args.rest('string').catch(() => `with ${this.container.client.user.username}`);

    try {
        const base = await loadImage(path.join(__dirname, '..', '..', 'utils', 'assets', 'images', 'steam-now-playing.png'));
        const avatar = await loadImage(guildMember.user.displayAvatarURL({ format: 'png', size: 64 }));
        
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        ctx.drawImage(avatar, 26, 26, 41, 42);
        ctx.fillStyle = '#90b93c';
        ctx.font = '14px Sans';
        ctx.fillText(guildMember.user.username, 80, 34);
        ctx.fillText(shortenText(ctx, game, 200), 80, 70);
        return reply(message, { files: [{ attachment: canvas.toBuffer(), name: 'steam-now-playing.png' }] });
    } catch (err) {
        return reply(message, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
  }
}