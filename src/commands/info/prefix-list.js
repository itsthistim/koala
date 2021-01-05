const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class AddPrefixCommand extends Command {
    constructor() {
        super('add-prefix', {
            category: 'Time',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ignoreCooldown: [],
            description: {
                content: '',
                usage: '<timezone>'
            },
        })
    }

*args() {
    const prefix = yield {
        type: Argument.validate('string', (m, p, str) => str.length <= 15),
        match: 'phrase',
        prompt: {
            start: 'Please provide a prefix to add',
            retry: 'Please provide a valid prefix. The prefix can\'t have more than 15 characters. Try again!',
            optional: false
        }
    };
    
    return { timezone };
}

    async exec(msg, args) {
        const [ prefixes ] = await DB.query(`SELECT Prefix FROM GuildPrefix WHERE Guild = ?`, [ msg.guild ]);

        let embed = this.client.util.embed()
        .setColor(global.gcolors[0]);

        if (prefixes.length < 1) {
            let prefixesStr;

            prefixes.forEach(element => {
                prefixesStr = `${prefixesStr}\`${element}\`\n`
            });

            embed.setDescription(prefixesStr);
        }
        else {
            embed.setTitle("There is no prefix set!");
            embed.setDescription(`You can interact with me by either using <@${this.client.user.id}> instead of a prefix or by adding a prefix with \`${global.gprefixes[0]}prefix add <your prefix>\`!`);
        }

    }
}