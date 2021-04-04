const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment');
const getDefinition = require('relevant-urban');

module.exports = class UserInfoCommand extends Command {
    constructor() {
        super('urban', {
            aliases: ['urban'],
            category: 'Info',
            args: [
                {
                    id: 'term',
                    match: 'text',
                    type: 'string',
                    prompt: {
                        start: 'Please provide a valid term.',
                        retry: 'Please provide a valid term. Try again!'
                    }
                }
            ],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
               content: 'Looks anything up on urbandictionary.com!',
               usage: '<term>'
            },
        })
    }

    async exec(msg, args) {

        let res;
        
        try {
            res = await getDefinition(args.term);
        } catch (error) {
            const errembed = this.client.util.embed()
            .setColor(global.gcolors[0])
            .setDescription(`:x: Nothing found!`);
            return msg.util.send(errembed);
        }

        const embed = this.client.util.embed()
        .setColor(global.gcolors[0])
        .setAuthor('Urban Dictionary', 'https://i.imgur.com//VFXr0ID.jpg')
        .setTitle(res.word)
        .setURL(res.urbanURL)
        .setDescription(res.definition.replace(/([\[\]])/g, ''))
        .addField('Example', res.example.replace(/([\[\]])/g, '') || 'None')
        .addField(':+1:', `${res.thumbsUp}`, true)
        .addField(':-1:',`${res.thumbsDown}`, true)
        .setFooter(`Posted by ${res.author}`);

        msg.util.send(embed);
    }
}