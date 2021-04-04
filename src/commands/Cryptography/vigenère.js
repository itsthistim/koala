// const { Command } = require('discord-akairo');
// const abc = 'abcdefghijklmnopqrstuvwxyz'.split('');

// module.exports = class VigenereCommand extends Command {
// 	constructor() {
// 		super('vigenère', {
// 			aliases: ['vigenère', 'vig', 'vigenere'],
// 			usage: 'vig <word> <text>',
//             description: 'Rotates the text according to the word!',
//             category: 'Math',
//             typing: true,
//             args: [
//                 {
//                     id: 'word',
//                     match: 'phrase',
//                 }, 
//                 {
//                     id: 'text',
//                     match: 'rest'
//                 }
//             ],
//             description: {
// 				content: 'Translates the text according to the number.\nAdd a - in front of the word to shift into the other direction.',
//                 usage: '<word> <text>'
// 			}
//         });
// 	}

// 	async exec(msg, { word, text }) {
//         var decode = word.startsWith('-') ? true : false; 
//         word = word.replace('-', '').split('');
//         var textarr = text.split('');
//         var result = "";
//         for (var i = 0; i < text.length; i++) {
//             if (abc.indexOf(textarr[i].toLowerCase()) !== -1) {
//                 if (textarr[i].toLowerCase() !== textarr[i]) {
//                     result += decode ? abc[wrap(abc.indexOf(textarr[i].toLowerCase()) - abc.indexOf(word[i % word.length]), abc.length) % abc.length].toUpperCase() :
//                                        abc[(abc.indexOf(textarr[i].toLowerCase()) + abc.indexOf(word[i % word.length])) % abc.length].toUpperCase();
//                 } else {
//                     result += decode ? abc[wrap(abc.indexOf(textarr[i]) - abc.indexOf(word[i % word.length]), abc.length) % abc.length] :
//                                        abc[(abc.indexOf(textarr[i]) + abc.indexOf(word[i % word.length])) % abc.length];
//                 }
//             } else {
//                 result += textarr[i];
//             }
//         }
//         msg.util.send("Vigenère ciphered text with `" + word.join('') + "`: **" + result + "**");
// 	}
// };

// function wrap(wrapped, num) {
//     do {
//         wrapped += num;
//     } while (wrapped < 0 );
//     return wrapped;
// }