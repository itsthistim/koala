const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');

module.exports = class SkipCommand extends Command {
  constructor(context, options) {
    super(context, {
      name: 'skip',
      aliases: ['skip', 's'],
      requiredUserPermissions: [],
      requiredClientPermissions: [],
      preconditions: ['ownerOnly'],
      subCommands: [],
      flags: [],
      options: [],
      nsfw: false,
      description: {
        content: 'Skips the current song.',
        usage: '',
        examples: []
      }
    });
  }

  async messageRun(message, args) {
    const queue = PLAYER.getQueue(message.guild);
    if (!queue || !queue.playing) return reply(message, { embeds: [{ description: `❌ | There is nothing to skip.`, color: COLORS.RED }] });
    const success = queue.skip();

    return success ? message.delete().catch(error => { }) : reply(message, { embeds: [{ description: `❌ | Could not skip this song.`, color: COLORS.RED }] });;
  }
}