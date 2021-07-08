const { Command } = require('discord-akairo');
const { Message } = require('discord.js');
const unscramble = require('unscramble');

module.exports = class UnscrambleCommand extends Command {
    constructor() {
        super('unscramble', {
            aliases: ['unscramble', 'unscr'],
            category: 'Utility',
            typing: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: [],
            description: {
				content: 'Unscrambles a scrambled word. This only works with english words.',
				usage: '<word>',
                examples: ['laoka'],
                field: ['Syntax' ,'<> = required, [] = optional']
			}
        });
    }

    *args() {
        const word = yield {
            type: 'string',
            match: 'rest',
            prompt: {
                start: 'What do you want me to unscramble?',
                retry: 'Please provide a valid word. Try again!',
                optional: false
            }
        };

        return { word };
    }

    async exec(msg, { word }) {

        let unscrambled = unscramble(word);

        if (unscrambled[0] != 'No results found.') {
            let res = '';
            unscrambled.forEach(w => {
                res += `\`${w}\`` + '\n';
            });
            
            msg.util.send(`**The unscrambled word${unscrambled.length > 1 ? 's are:' : ' is:'}**\n\n${res}`);
        }
        else {
            msg.util.send(unscrambled[0]);
        }
    }
}