const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');
const wd = require('word-definition');

module.exports = class DefineCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'define',
            aliases: ['define'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Defines a word using Wiktionary.',
                usage: '<word>',
                examples: ['koala']
            },
            detailedDescription: ''
        });
    }

    async messageRun(msg, args) {
        var word = await args.rest('string').catch(() => null);
        if (!word) return reply(msg, "Please provide a word for me to define!")

        // todo: add language flags
        const german = false;
        const french = false;

        var embed = new MessageEmbed();
        embed.setAuthor({ name: "Wiktionary", iconURL: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Wiktionary-logo-v2.svg/1200px-Wiktionary-logo-v2.svg.png' })

        if (german) {
            wd.getDef(word, 'de', null, function (result) {
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                reply(msg, { embeds: [embed] });
            });
        }
        else if (french) {
            wd.getDef(word, 'fr', null, function (result) {
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                reply(msg, { embeds: [embed] });
            });
        }
        else {
            wd.getDef(word, 'en', null, function (result) {
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                reply(msg, { embeds: [embed] });
            });
        }
    }
}