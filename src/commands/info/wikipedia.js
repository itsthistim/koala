const { Command } = require('discord-akairo');
const snekfetch = require('snekfetch');
const axios = require('axios');
const querystring = require('querystring');


module.exports = class WikipediaCommand extends Command {
    constructor() {
        super('wikipedia', {
            aliases: ['wikipedia', 'wiki'],
            category: 'Info',
            userPermissions: [],
            clientPermissions: ['EMBED_LINKS'],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            channel: 'guild',
            description: {
                content: 'Searchs wikipedia for a anything.',
                usage: ['Bob Ross', 'Koala']
            },
        })
    }

    *args() {
        const query = yield {
            type: 'string',
            match: 'text',
            prompt: {
                start: 'What would you like to look for?',
                retry: 'Please provide a valid term. Try again!',
                optional: false
            }
        };
        
        return { query };
    }

    async exec(msg, args) {
        try {
            const { body } = await snekfetch
                .get('https://en.wikipedia.org/w/api.php')
                .query({
                    action: 'query',
                    prop: 'extracts',
                    format: 'json',
                    titles: args.query,
                    exintro: '',
                    explaintext: '',
                    redirects: '',
                    formatversion: 2
                });

            // const { body } = await axios.get('https://en.wikipedia.org/w/api.php/', querystring.stringify({
            //     action: 'query',
            //     prop: 'extracts',
            //     format: 'json',
            //     titles: args.query,
            //     exintro: '',
            //     explaintext: '',
            //     redirects: '',
            //     formatversion: 2
            // }));

                // const { body } = await axios
                // .get('https://en.wikipedia.org/w/api.php')
                // .query({
                //     action: 'query',
                //     prop: 'extracts',
                //     format: 'json',
                //     titles: args.query,
                //     exintro: '',
                //     explaintext: '',
                //     redirects: '',
                //     formatversion: 2
                // });

            if (body.query.pages[0].missing) throw new error('No Results.');

            console.log(body.query.pages[0])

            const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(body.query.pages[0].title)
                .setAuthor('Wikipedia', 'https://i.imgur.com/a4eeEhh.png')
                .setDescription(body.query.pages[0].extract.substr(0, 2000).replace(/[\n]/g, '\n\n'));
                return msg.channel.send(embed);

        } catch (err) {
            const failembed = this.client.util.embed()
                .setColor(global.gcolors[2])
                .setAuthor('Wikipedia', 'https://i.imgur.com/a4eeEhh.png')
                .setDescription("I was not able to find what you were looking for...");
                return msg.util.send(failembed);
        }
    }
}