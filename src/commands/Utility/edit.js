const { Command } = require('discord-akairo');
const owoify = require('owoify-js').default;

module.exports = class SayCommand extends Command {
    constructor() {
        super('edit', {
            aliases: ['edit', 'edit-say'],
            category: 'Utility',
            typing: true,
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            args: [
                {
                    id: 'editmessage',
                    match: 'phrase',
                    type: 'message',
					prompt: {
						start: 'What message do you want me to edit?',
						retry: 'Please provide a valid message ID. Try again!',
					}
                },
                {
                    id: 'text',
                    match: 'rest',
                    type: 'string',
					prompt: {
						start: 'What do you want me to say?',
						retry: 'Please provide a valid text. Try again!',
					}
                },
                {
                    id: 'tts',
                    match: 'flag',
                    flag: ['-tts', '--tts']
                },
                {
                    id: 'uwu',
                    match: 'flag',
					flag: ['-uwu', '--uwu', '-owo', '--owo', '-uvu', '--uvu', '-owu', '--owu', '-uwo', '--uwo']
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
				content: 'Makes me edit a message by me.\n--tts requires me to have the \`Send TTS Messages\` permission.\n--owo will infuse the text in a cute way.',
				usage: '<text> [--tts] [--owo] [--silent]',
				examples: ['Hey, how are you?', 'Thank you, I am feeling great! --tts', 'Great to hear that! --owo']
			}
        });
    }

    async exec(msg, args) {

        if (args.silent) {
            msg.delete({ timeout: 5000 });
        }

        if (args.editmessage.author != this.client.user) {
            return msg.util.send("I can't edit this message as I am not the author!")
        }
        else {
            if (args.embedded) {
                let embed = this.client.util.embed();
                embed.setColor(global.gcolors[0])
                if (args.silent) {
                    embed.setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                }
                else {
                    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                }
            
                if (args.uwu) {
                    embed.setDescription(`${owoify(args.text, 'uwu')}`);   
                }
                else {
                    embed.setDescription(args.text);
                }
    
                return args.editmessage.edit(embed);
            }
            else if (args.uwu) {
                if (args.tts) {
                    return args.editmessage.edit(owoify(args.text, 'uwu'), {
                        tts: true
                    })
                }
                else {
                    return args.editmessage.edit(owoify(args.text, 'uwu'));
                }
            }
            else if (args.tts) {
                return args.editmessage.edit(args.text, {
                    tts: true
                })
            }
            else {
                return args.editmessage.edit(args.text);
            }
        }
    }
}