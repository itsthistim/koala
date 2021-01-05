const { Command } = require('discord-akairo');
const abc = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = class Base64Command extends Command {
	constructor() {
		super('base64', {
			aliases: ['base64', 'b64'],
            typing: true,
            // category: 'Math',
            args: [
                {
                    id: 'text',
                    match: 'rest'
                }
            ],
            description: {
				content: 'Convert any text to base64!\nAdd a - in front of your query to decipher a base64 code.',
				usage: '<text>'
			}
        });
	}

	async exec(msg, { text }) {
        text.startsWith('-') ? msg.util.send(`Decoded Text: \`${Buffer.from(text.replace('-', ''), 'base64').toString('ascii')}\``) : msg.util.send(`Encoded Text: \`${Buffer.from(text.replace('-', '')).toString('base64')}\``);
	}
};