const { Argument, Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class AddPrefixCommand extends Command {
    constructor() {
        super('prefix-list', {
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            description: {
                content: '',
                usage: '<timezone>'
            },
        })
    }

    async exec(msg) {
        const [ prefixes ] = await DB.query(`SELECT * FROM GuildPrefix WHERE Guild = ?`, [ msg.guild.id ]);

        console.log(prefixes)
        console.log(prefixes.length)

        let embed = this.client.util.embed()
        .setColor(global.gcolors[0]);

        if (prefixes.length > 0) {
            let prefixesStr = '';

            let i = 1;
            prefixes.forEach(element => {
                prefixesStr = `${prefixesStr}${i}. ${element.Prefix}\n`;
                i++;
            });

            embed.setAuthor(`Prefix${prefixes.length > 1 ? 'es' : ''} for ${msg.guild.name}`, this.client.user.avatarURL())
            embed.setDescription(prefixesStr);
        }
        else {
            embed.setTitle("There is no prefix set!");
            embed.setDescription(`You can interact with me by either using <@${this.client.user.id}> instead of a prefix or by adding a prefix with \`${this.handler.prefix[0]}prefix add <your prefix>\`!`);
        }

        return msg.channel.send(embed);
    }
}