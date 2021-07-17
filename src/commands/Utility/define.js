const { Command } = require('discord-akairo');
const { Message } = require('discord.js');
const wd = require('word-definition');

module.exports = class DefineCommand extends Command {
    constructor() {
        super('define', {
            aliases: ['define', 'define-word', 'word-define', 'define-w', 'w-define', 'def', 'w-def', 'def-w'],
            category: 'Utility',
            typing: true,
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            userPermissions: [],
            args: [
                {
                    id: 'word',
                    match: 'text',
                    type: 'string',
					prompt: {
						start: 'What word do you want to define?',
						retry: 'Please provide a valid word. Try again!'
                    },
                },
                {
                    id: 'german',
                    match: 'flag',
                    flag: ['-de', '--de', '-ger', '--ger', '-dt', '--dt']
                },
                {
                    id: 'french',
                    match: 'flag',
                    flag: ['-fr', '--fr', '-fra', '--fra']
                }
            ],
            description: {
				content: 'Defines a word.\n\n-ger can be used to define a German word instead of an English one.\n-fra can be used to define a French word instead of an English one.',
				usage: '<word> [-eng | -ger | -fra ]',
                examples: ['koala', 'koala -eng', 'Dampfschiff -ger', 'baguette -fra'],
                field: ['Syntax' ,'<> = required, [] = optional', '| = or']
			}
        });
    }
    
    // *args() {
    //     const text = yield {
    //         type: 'string',
    //         match: 'rest',
    //         prompt: {
    //             start: 'What do you want me to say?',
    //             retry: 'Please provide a valid text. Try again!',
    //             optional: false
    //         }
    //     };

    //     const channel = yield {
    //         match: 'option',
    //         //flag: ['-c', '--c', '-channel', '--channel', '-c:', '--c:', '-channel:', '--channel:']
    //     };

    //     const tts = yield {
    //         match: 'flag',
    //         flag: ['-tts', '--tts'],
    //     };

    //     const owo = yield {
    //         match: 'flag',
    //         flag: ['-owo', '--owo'],
    //     };

    //     const uwu = yield {
    //         match: 'flag',
    //         flag: ['-uwu', '--uwu'],
    //     };

    //     const uvu = yield {
    //         match: 'flag',
    //         flag: ['-uvu', '--uvu'],
    //     };

    //     const embedded = yield {
    //         match: 'flag',
    //         flag: ['-e', '--e', '-embed', '--embed', '-embedded', '--embedded'],
    //     };
        
    //     const silent = yield {
    //         match: 'flag',
    //         flag: ['-s', '--s', '-silent', '--silent', '-d', '--d', '-delete', '--delete'],
    //     };

    //     return { text, owo, uwu, uvu, tts, embedded, silent, channel };
    // }

    async exec(msg, args) {
        var embed = this.client.util.embed();
        console.log(args)
        if (args.german) {
            msg.channel.send("de");
            wd.getDef(args.word, 'de', null, function(result) {
                embed.setAuthor("Wiktionary", 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Wiktionary-logo-v2.svg/1200px-Wiktionary-logo-v2.svg.png')
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                msg.util.send(embed);
            });
        }
        else if (args.french) {
            msg.channel.send("fr");
            wd.getDef(args.word, 'fr', null, function(result) {
                embed.setAuthor("Wiktionary", 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Wiktionary-logo-v2.svg/1200px-Wiktionary-logo-v2.svg.png')
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                msg.util.send(embed);
            });
        }
        else {
            msg.channel.send("else");
            wd.getDef(args.word, 'en', null, function(result) {
                console.log(result)
                embed.setAuthor("Wiktionary", 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Wiktionary-logo-v2.svg/1200px-Wiktionary-logo-v2.svg.png')
                if (!result.err) {
                    embed.addField(result.word, result.definition);
                }
                else {
                    embed.setDescription(`I could not find a definition for ${result.word}.`);
                }
                msg.util.send(embed);
            });
        }
    }
}