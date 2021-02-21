const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const paste = require('better-pastebin');
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
                content: 'Lists all servers.',
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
        // msg.delete();

        if (!g) {
            let xa = this.client.users.cache.get('319183644331606016');

            let tablearr = [];
            tablearr.push(['Name', 'ID', 'Members', 'Bots', 'Total', ])
            this.client.guilds.cache.map(g => tablearr.push([g.name, g.id, g.members.cache.filter(u => !u.user.bot).size, g.members.cache.filter(u => u.user.bot).size, g.members.cache.size])); // fill in data

            let table = markdownTable(tablearr, { padding: false });

            paste.setDevKey(process.env.PASTEBIN_APIKEY);
            paste.create({
              contents: table.toString(),
              name: "Serverlist",
              privacy: "1", // 0 - Public, 1 - Unlisted, 2 - Private
              expires: "1H"
            },
            function(success, data) {
              if(success) {
                xa.send(`Serverlist: <${data}>`);
              } else {
                xa.send(`No success ${data}`);
              }
            });
        }
        else if (g) {
            // lol
        }
    }
}
