// const { Command } = require('discord-akairo');
// const abc = 'abcdefghijklmnopqrstuvwxyz'.split('');

// module.exports = class NumToLetterCommand extends Command {
// 	constructor() {
// 		super('numtoletter', {
// 			aliases: ['num-to-letter', 'letter-to-num', 'ntl', 'ltn', 'num-to-text', 'text-to-num', 'ntt', 'ttn'],
//             typing: true,
//             category: 'Text',
//             args: [
//                 {
//                     id: 'text',
//                     match: 'rest',
//                 }
//             ],
//             description: {
// 				content: 'Converts text to numbers!\nTo convert a number back to text add a - in front of the first number.',
//                 usage: '<text>',
//                 examples: ['abc', '-0 1 2']
//             }
//         });
// 	}

// 	async exec(msg, { text }) {
//         text.startsWith('-') ? msg.util.send(`Decoded Text: \`${text.replace('-', '').split(' ').map((e) => abc[Number(e)/*-1*/]).join('')}\``) : msg.util.send(`Encoded Text: \`${text.replace('-', '').split('').map((e) => abc.indexOf(e)).join(' ')}\``);
// 	}
// };