const { Command } = require('discord-akairo');
const owoify = require('owoify-js').default;

module.exports = class SayCommand extends Command {
    constructor() {
        super('say', {
            aliases: ['say', 'talk'],
            category: 'Utility',
            typing: true,
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            userPermissions: [],
            // flags: ['-tts', '--tts', '-owo', '--owo', '-uwu', '--uwu', '-uvu', '--uvu', '-e', '--e', '-embed', '--embed', '-embedded', '--embedded', '-s', '--s', '-silent', '--silent', '-d', '--d', '-delete', '--delete'],
            // optionFlags: ['-c', '--c', '-channel', '--channel', '-c:', '--c:', '-channel:', '--channel:'],
            args: [
                {
                    id: 'channel',
                    match: 'option',
                    flag: ['-c', '--c', '-channel', '--channel', '-c:', '--c:', '-channel:', '--channel:']
                },
                {
                    id: 'text',
                    match: 'rest',
                    type: 'string',
					prompt: {
						start: 'What do you want me to say?',
						retry: 'Please provide a valid text. Try again!'
                    },
                },
                {
                    id: 'tts',
                    match: 'flag',
                    flag: ['-tts', '--tts']
                },
                {
                    id: 'owo',
                    match: 'flag',
					flag: ['-owo', '--owo']
                },
                {
                    id: 'uwu',
                    match: 'flag',
					flag: ['-uwu', '--uwu']
                },
                {
                    id: 'uvu',
                    match: 'flag',
					flag: ['-uvu', '--uvu']
                },
                {
                    id: 'embedded',
                    match: 'flag',
                    flag: ['-embed', '--embed', '-e', '--e']
                },
                {
                    id: 'silent',
                    match: 'flag',
					flag: ['-delete', '--delete', '-del', '--del', '-silent', '--silent', '-d', '--d', '-s', '--s']
                }
            ],
            description: {
				content: 'Makes me say anything.\n-channel can be used to set a destination for the message.\n-silent will delete the invocation message for you.\n-embed will put your text into a simple embed\n-tts requires me to have the \`Send TTS Messages\` permission.\n-owo will infuse the text in a cute way.',
				usage: '<text> [-channel:<channel>] [-silent] [-embed] [-tts] [-owo]',
                examples: ['Hey, how are you?', 'Thank you, I am feeling great! -tts', 'Great to hear that! -owo'],
                field: ['Syntax' ,'<> = required, [] = optional']
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

        let member = msg.guild.members.cache.get(msg.author.id);

        const inviteRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(\.gg|(app)?\.com\/invite|\.me)\/([^ ]+)\/?/gi;
        const botInvRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(app)?\.com\/(api\/)?oauth2\/authorize\?([^ ]+)\/?/gi;
    
        args.text = args.text.replace(inviteRegex, '⠀');
        args.text = args.text.replace(botInvRegex, '⠀');

        let destination;
        if(args.channel) {
            destination = this.client.util.resolveChannel(args.channel, msg.guild.channels.cache);
        }
        else {
            destination = msg.channel;
        }

        if (args.silent) {
            msg.delete().catch(e => {});
        }

        if (args.embedded) {
            let embed = this.client.util.embed();
            embed.setColor(global.gcolors[0]);

            if (args.silent) {
                embed.setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
            }
            else {
                embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            }

            if (args.owo) {
                if (args.tts) {
                    embed.setDescription(owoify(args.text, 'owo'), { tts: true })
                }
                else {
                    embed.setDescription(owoify(args.text, 'owo'));
                }
            }
            else if (args.uwu) {
                if (args.tts) {
                    embed.setDescription(owoify(args.text, 'uwu'), { tts: true })
                }
                else {
                    embed.setDescription(owoify(args.text, 'uwu'));
                }
            }
            else if (args.uvu) {
                if (args.tts) {
                    embed.embed.setDescription(owoify(args.text, 'uvu'), { tts: true })
                }
                else {
                    embed.setDescription(owoify(args.text, 'uvu'));
                }
            }
            else {
                embed.setDescription(args.text);
            }

            return destination.send(embed);
        }
        else if (args.owo) {
            if (args.tts) {
                return destination.send(owoify(args.text, 'owo'), { tts: true })
            }
            else {
                return destination.send(owoify(args.text, 'owo'));
            }
        }
        else if (args.uwu) {
            if (args.tts) {
                return destination.send(owoify(args.text, 'uwu'), {
                    tts: true
                })
            }
            else {
                return destination.send(owoify(args.text, 'uwu'));
            }
        }
        else if (args.uvu) {
            if (args.tts) {
                return destination.send(owoify(args.text, 'uvu'), {
                    tts: true
                })
            }
            else {
                return destination.send(owoify(args.text, 'uvu'));
            }
        }
        else if (args.tts) {
            return destination.send(args.text, {
                tts: true
            })
        }
        else {
            return destination.send(args.text);
        }
    }
}