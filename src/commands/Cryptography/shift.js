const { Command } = require('discord-akairo');
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = class ShiftCommand extends Command {
	constructor() {
		super('shift', {
			aliases: ['shift', 'caesar', 'ceasar', 'rot', 'rotate'],
            category: 'Cryptography',
            typing: true,
            args: [
                {
                    id: 'number',
                    type: 'integer'
                },
                {
                    id: 'text',
                    match: 'rest'
                }
            ],
            description: {
				content: 'Shifts the text by any number!\nAdd a - in front of the number to shift the text in the other direction.',
                usage: '<number> <text>',
                examples: ['4 abc', '-4 efg']
			}
        });
	}

	async exec(msg, { number, text }) {
        var decode = number < 0 ? true : false;
        
        if (number < 0) {
            number = number * -1;
        }

        number = number % alphabet.length;
        
        var textarr = text.split('');
        var result = "";

        for (var i = 0; i < text.length; i++) {
            if (alphabet.indexOf(textarr[i].toLowerCase()) !== -1) {
                if (textarr[i].toLowerCase() !== textarr[i]) {
                    result += decode ? alphabet[wrap(alphabet.indexOf(textarr[i].toLowerCase()) - number, alphabet.length) % alphabet.length].toUpperCase() : alphabet[(alphabet.indexOf(textarr[i].toLowerCase()) + number) % alphabet.length].toUpperCase();
                } else {
                    result += decode ? alphabet[wrap(alphabet.indexOf(textarr[i]) - number, alphabet.length) % alphabet.length] : alphabet[(alphabet.indexOf(textarr[i]) + number) % alphabet.length];
                }
            } else {
                result += textarr[i];
            }
        }
        msg.util.send("`" + number + "`: **" + result + "**");
	}
};

function wrap(wrapped, num) {
    do {
        wrapped += num;
    } while (wrapped < 0 );
    return wrapped;
}