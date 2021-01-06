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
            ignoreCooldown: [],
            description: {
                content: '',
                usage: '<timezone>'
            },
        })
    }

    async exec(msg) {
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

        return msg.channel.send(embed);
    }
}