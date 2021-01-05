const { Command } = require('discord-akairo');
const abc = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = class ShiftCommand extends Command {
	constructor() {
		super('shift', {
			aliases: ['shift', 'caesar', 'ceasar', 'rot', 'rotate'],
            typing: true,
            // category: 'Math',
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

        number = number % abc.length;
        
        var textarr = text.split('');
        var result = "";

        for (var i = 0; i < text.length; i++) {
            if (abc.indexOf(textarr[i].toLowerCase()) !== -1) {
                if (textarr[i].toLowerCase() !== textarr[i]) {
                    result += decode ? abc[wrap(abc.indexOf(textarr[i].toLowerCase()) - number, abc.length) % abc.length].toUpperCase() : abc[(abc.indexOf(textarr[i].toLowerCase()) + number) % abc.length].toUpperCase();
                } else {
                    result += decode ? abc[wrap(abc.indexOf(textarr[i]) - number, abc.length) % abc.length] : abc[(abc.indexOf(textarr[i]) + number) % abc.length];
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