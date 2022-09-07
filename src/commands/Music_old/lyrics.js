const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const { colours } = require('nodemon/lib/config/defaults');

module.exports = class LyricsCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'lyrics',
            aliases: ['lyrics'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Attempts to find lyrics for a song.',
                usage: '[song]',
                examples: ['', 'bitch lasagna']
            },
            detailedDescription: 'If no song is specified, it will attempt to find the lyrics for the song that is currently playing.'
        });
    }

    async messageRun(message, args) {
        var query = await args.rest('string').catch(() => null);
        const queue = PLAYER.getQueue(message.guild);

        if (query || (queue && queue.playing)) {
            if (!query) query = queue.current.title;

            const result = await LYRICS.search(query);
            if (!result) {
                reply(message, { embeds: [{ description: !query ? "No lyrics found for `" + query + "`.\nTry manually searching using `" + this.container.client.options.defaultPrefix[0] + "lyrics <query>`" : "No lyrics found for `" + query + "`. Try being more specific with your query!", color: colours.RED }] });
            }
            else {
                let trimmedLyrics = result.lyrics.length > 4095 ? result.lyrics.substring(0, 4092) + "..." : result.lyrics;
                message.reply({
                    embeds: [{
                        title: `${result.title} - ${result.artist.name}`,
                        url: result.url,
                        thumbnail: {
                            url: result.thumbnail,
                        },
                        description: trimmedLyrics,
                        color: COLORS.DEFAULT
                    }]
                });
            }
        }
    }
}