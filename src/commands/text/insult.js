const { Command } = require('discord-akairo');
const { get } = require('axios');

module.exports = class InsultCommand extends Command {
    constructor() {
        super('insult', {
            aliases: ['insult'],
            category: 'Text',
            args: [
                {
                    id: 'user',
                    match: 'phrase',
                    type: 'user',
                    prompt: {
                        start: 'What user do you want to insult?',
                        retry: 'Please provide a valid user. Try again!',
                        optional: true
                    }
				},
                {
                    id: 'tts',
                    match: 'flag',
					flag: '--tts'
				}
            ],
            description: {
                content: 'Send an insult! Optionally you can even insult other users.',
                usage: '[user]'
			}
        });
    }

    exec(message, args) {

        message.delete({ timeout: 5000 });

        get('https://insult.mattbas.org/api/insult')
        .then(res => {
            let restext = JSON.stringify(res.data).split('"')[1];

            if (args.user) {
                restext = restext.charAt(0).toLowerCase() + restext.substring(1);
                if (args.tts) {
                    if (args.user.id != this.client.user.id) {
                        return message.util.send(`<@${args.user.id}>, ${restext}.`, {
                            tts: true
                        });   
                    }
                    else {
                        return message.util.send(`<@${message.author.id}>, ${restext}.`, {
                            tts: true
                        });
                    }
                }
                else {
                    if (args.user.id != this.client.user.id) {
                        return message.util.send(`<@${args.user.id}>, ${restext}.`);   
                    }
                    else {
                        return message.util.send(`<@${message.author.id}>, ${restext}.`);   
                    }
                }
            }
            else {
                return message.util.send(restext);
            }
        })
    }
}