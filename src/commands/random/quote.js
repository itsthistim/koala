const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const { get } = require('axios');

module.exports = class QuoteCommand extends Command {
   constructor() {
       super('quote', {
            aliases: ['quote', 'inspirational-quote'],
            category: 'Random',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
               content: 'Provides an inspirational quote for you.',
               usage: ''
           },
       })
   }

    async exec(msg, args) {   

        msg.delete({ timeout: 5000 });

        let quote = await this.getQuote();
        let embed = this.client.util.embed();
        embed.setColor(`RANDOM`);
        embed.setTitle(`Inspirational quote`);
        embed.setURL(quote);
        embed.setImage(quote);
        embed.setFooter(`Powered by https://inspirobot.me/`);

        msg.util.send(embed);
    }

    async getQuote() {
        const res = await get(`https://inspirobot.me/api?generate=true`);
        return res.data;
    }
}