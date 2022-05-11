const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');


module.exports = class DecryptCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'decrypt',
            aliases: ['decrypt'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Decrypts a message.',
                usage: '<message> <method> [key]',
                examples: ['"lipps asvph!" ceasar 4']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        var text = await args.pick('string').catch(() => null);
        var method = await args.pick('string').catch(() => null);
        var key = await args.pick('string').catch(() => null);

        if (!text) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a message to decrypt.`, color: COLORS.RED }] });
        if (!method) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a method to decrypt with.`, color: COLORS.RED }] });
        if (!key) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a key to decrypt with.`, color: COLORS.RED }] });

        var methods = {
            ceasar: (text, key) => {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz';
                var decrypted = '';
                var key = parseInt(key);

                for (var i = 0; i < text.length; i++) {
                    var char = text[i];
                    var index = alphabet.indexOf(char.toLowerCase());
                    if (index !== -1) {
                        var newIndex = (index - key) % 26;
                        decrypted += alphabet[newIndex];
                    } else {
                        decrypted += char;
                    }
                }

                return decrypted;
            },
            vigenere: (text, key) => {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz';
                var decrypted = '';
                var key = key.toLowerCase();

                for (var i = 0; i < text.length; i++) {
                    var char = text[i];
                    var index = alphabet.indexOf(char.toLowerCase());
                    if (index !== -1) {
                        var newIndex = (index - key) % 26;
                        decrypted += alphabet[newIndex];
                    } else {
                        decrypted += char;
                    }
                }

                return decrypted;
            }
        };

        var decrypted = methods[method](text, key);
        return reply(message, { embeds: [{ description: `${EMOJIS.POSITIVE} Decrypted message: \`\`\`${decrypted}\`\`\``, color: COLORS.GREEN }] });
    }
}