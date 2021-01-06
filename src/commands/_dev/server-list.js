const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const hb = require('hastebin-paste');
const fs = require('fs');
const markdownTable = require('markdown-table');

module.exports = class ServerlistCommand extends Command {
    constructor() {
        super('server-list', {
            aliases: ['server-list', 's-list'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            description: {
                content: 'Lists all servers that I am in.',
                usage: ''
            },
        })
    }

    *args() {
        const g = yield {
            type: 'guild',
            match: 'phrase',
            prompt: {
                start: 'Provide a guild.',
                retry: 'Please provide a valid g. Try again!',
                optional: true
            }
        };
        
        return { g };
    }

    async exec(msg, { g }) {
        msg.delete({ timeout: 5000 })

        if (!g) {
            let xa = this.client.users.cache.get('319183644331606016');

            let tablearr = [];
            tablearr.push(['Name', 'ID', 'Members', 'Bots', 'Total', ])
            this.client.guilds.cache.map(g => tablearr.push([g.name, g.id, g.members.cache.filter(u => !u.user.bot).size, g.members.cache.filter(u => u.user.bot).size, g.members.cache.size])); // fill in data

            let table = markdownTable(tablearr, { padding: false });

            hb(table.toString(), { /*extension: "none",*/ prefix: " ", message: " " })
            .then(haste => {
                xa.send(haste);
            })
        }
        else if (g) {
            // lol
        }
    }
}