const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { Player } = require('discord-player');


module.exports = class SongRemoveCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'remove',
            aliases: ['remove', 'rem'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Removes a song from the queue with an index.',
                usage: '<song index>',
                examples: ['2']
            },
            detailedDescription: `\nYou can see a list of all songs with the \`queue\` command.`
        });
    }

    async messageRun(message, args) {
        var index = await args.pick('number').catch(() => null);
        const queue = PLAYER.getQueue(message.guild.id);

        if (!index) return reply(message, 'You must provide a valid song index.');
        if (!queue) return reply(message, 'There is no queue.');
        if (index > queue.length || index < 1) return reply(message, 'That index is out of range.');

        const song = queue.tracks[index - 1];
        if (!song) return reply(message, 'That index is out of range.');

        queue.remove(index - 1);
        reply(message, `Removed **${song.title}** from the queue.`);
    }
}