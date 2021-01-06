const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class GoogleCommand extends Command {
   constructor() {
       super('google', {
            aliases: ['google'],
            category: 'Lookup',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            args: [
                {
                    id: 'query',
                    match: 'text',
                    type: 'string',
                    prompt: {
                        start: 'What can I google for you?',
                        retry: 'Please provide a valid query. Try again!',
                    }
                },
                {
                    id: 'lmgtfy',
                    match: 'flag',
                    flag: ['--lmgtfy' ,'-lmgtfy']
                }
            ],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
               content: 'This command will search the internet for whatever you want.\nIf you add the \`--lmgtfy\` flag to the command it will attach a handy tutorial on how to use the internet.',
               usage: '<query> [--lmgtfy]',
               examples: ['--lmgtfy what is a bot', 'how to add a discord bot']
           },
       })
   }

    async exec(msg, { lmgtfy, query }) {
        msg.delete({ timeout: 5000 });

        if (lmgtfy) {
            let lmgtfyembed = this.client.util.embed()
                .setTitle("Hold up!")
                .setDescription(`${msg.author}[ googled that for you!](https://lmgtfy.com/?iie=1&q=${encodeURIComponent(query)})`)
                .setColor('RANDOM');
            msg.util.send(lmgtfyembed)
        }
        else {
            let googleembed = this.client.util.embed()
             .setTitle(query)
             .setDescription(`[Here is what I found!](https://www.google.com/search?q=${encodeURIComponent(query)})`)
             .setColor('RANDOM');
            msg.util.send(googleembed)
        }
    }
}