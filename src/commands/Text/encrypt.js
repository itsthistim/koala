const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed } = require('discord.js');

module.exports = class EncryptCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'encrypt',
            aliases: ['encrypt'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Encrypts a message.',
                usage: '<message> <method> [key]',
                examples: ['"Hello world!" ceasar 4']
            },
            detailedDescription: ''
        });
    }

    async messageRun(message, args) {
        var text = await args.pick('string').catch(() => null);
        var method = await args.pick('string').catch(() => null);
        var key = await args.pick('string').catch(() => null);

        if (!text) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a message to encrypt.`, color: COLORS.RED }] });
        if (!method) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a method to encrypt with.`, color: COLORS.RED }] });
        if (!key) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} Please provide a key to encrypt with.`, color: COLORS.RED }] });

        var methods = {
            ceasar: (text, key) => {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz';
                var encrypted = '';
                var key = parseInt(key);

                for (var i = 0; i < text.length; i++) {
                    var char = text[i];
                    var index = alphabet.indexOf(char.toLowerCase());
                    if (index !== -1) {
                        var newIndex = (index + key) % 26;
                        encrypted += alphabet[newIndex];
                    } else {
                        encrypted += char;
                    }
                }

                return encrypted;
            },
            vigenere: (text, key) => {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz';
                var encrypted = '';
                var key = key.toLowerCase();

                for (var i = 0; i < text.length; i++) {
                    var char = text[i];
                    var index = alphabet.indexOf(char.toLowerCase());
                    if (index !== -1) {
                        var newIndex = (index + alphabet.indexOf(key[i % key.length])) % 26;
                        encrypted += alphabet[newIndex];
                    } else {
                        encrypted += char;
                    }
                }

                return encrypted;
            }
        };

        if (!methods[method]) return reply(message, { embeds: [{ description: `${EMOJIS.NEGATIVE} That method does not exist.`, color: COLORS.RED }] });

        var encrypted = methods[method](text, key);

        return reply(message, { embeds: [{ description: `${EMOJIS.POSITIVE} Encrypted message: \`${encrypted}\``, color: COLORS.GREEN }] });
    }
}