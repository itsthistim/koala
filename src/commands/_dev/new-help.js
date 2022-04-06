const { Command, Argument } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const Logger = require('../../util/logger.js');

module.exports = class NewHelpCommand extends Command {
    constructor() {
        super('new-help', {
            aliases: ['nh'],
            category: '',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            args: [
                {
                    id: "command",
                    type: Argument.union("command", "commandAlias"),
                    default: null,
                    match: "restContent",
                },
            ],
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })
    }

    async exec(message, { command }) {
        let SearchCollector;
        // let filter = m => m.content.toLowerCase() === 'catch';
        // let SearchCollector = message.channel.createMessageCollector(filter, {max: 10, time: 10000});

        let prefix = this.handler.prefix[0];

        if (!command || command === null) {
            const HOME = this.client.util.embed()
            .setTitle("Help | Home")
            .addFields([
                {
                    name: "🏠 | Home",
                    value: "Returns to this page",
                },
                {
                    name: "📚 | Commands",
                    value: "Shows all categories along with their commands",
                },
                {
                    name: "🔎 | Search",
                    value: "Search for any command or alias",
                }
            ])
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

            const COMMANDS = this.client.util.embed()
            .setTitle("Help | Commands")
            .setDescription(`View all commands and their categories below.\nFor further info about a specific command, use \`${prefix}help <command>\`!`);

            var categories = this.handler.categories.values();
            for (const c of categories) {
                const title = c.id;
                if (title == 'default') {
                    continue;
                }
                else if (title) {
                    // embed.addField(c.id, `\`${c.map(cmd => cmd.aliases[0]).join('` `')}\``/*, true*/);
                    COMMANDS.addField(`${title} [${c.size}]`, `\`${c.map((c) => c.id).join("`, `")}\``);
                }
            }

            const SEARCH = this.client.util.embed()
            .setTitle("Help | Search")
            .setDescription("Find commands or aliases by typing a query");

            const msg = await message.util.send(HOME);
            try {
                await msg.react("🏠");
                await msg.react("📚");
                await msg.react("🔎");
            } catch (er) {
                console.log(er);
            }

            const collector = msg.createReactionCollector((r, u) => {
                return ["🏠", "📚", "🔎"].includes(r.emoji.name) && !u.bot;
            },
                { time: 3e5 }
            );

            collector.on("collect", async (r, u) => {
                if (u.bot) return;
                if (!["🏠", "📚", "🔎"].includes(r.emoji.name)) return;
                r.users.remove(u.id);
                switch (r.emoji.name) {
                    case "🏠":
                        msg.edit(HOME);

                        if (SearchCollector === null || SearchCollector === void 0 ? void 0 : SearchCollector.client) {
                            SearchCollector.stop();
                        }

                        break;
                    case "📚":
                        msg.edit(COMMANDS);

                        if (SearchCollector === null || SearchCollector === void 0 ? void 0 : SearchCollector.client) {
                            SearchCollector.stop();
                        }

                        break;
                    case "🔎":
                        msg.edit(SEARCH);

                        const filter = m => !m.author.bot;
                        SearchCollector = msg.channel.createMessageCollector(filter, { time: 3e5 });
                        SearchCollector.on("collect", (m) => {
                            // todo (res: any) might cause problems

                            let res = this.handler.modules.filter((c) => {
                                var _a;
                                return (((_a = c.id.toLowerCase().match(new RegExp(m.content.toLowerCase(), "g"))) === null || _a === void 0 ? void 0 : _a.length) > 0);
                            }) ||
                                this.handler.modules.filter((c) => {
                                    return c.aliases.some((v) => {
                                        var _a;
                                        return (((_a = v.toLowerCase().match(new RegExp(m.content.toLowerCase(), "g"))) === null || _a === void 0 ? void 0 : _a.length) > 0);
                                    });
                                });

                            const RESULT = this.client.util.embed().setTitle("Search Results");

                            if (!res.first()) {
                                RESULT.setDescription("No commands or aliases have been found.");
                                SearchCollector.stop();
                                msg.edit(RESULT);
                                return m.delete();
                            }

                            if (Object.keys(res.first()).includes("category")) {
                                RESULT.setDescription("Found Command");
                                var _a;
                                RESULT.addField(res.first().id, stripIndents`
                                **\\>** Name: **${res.first().id}**
                                **\\>** Aliases: **${res.first().aliases.join("**, **")}**
                                **\\>** Cooldown: **"TODO"**
                                **\\>** Description: **${res.first().description.toString()}**
                                ${res.first().ownerOnly ? "**Developer Only!**" : ""}`)
                                RESULT.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

                                // insert at TODO above ${ms(res.first().cooldown ?? this.handler.defaultCooldown, { long: true })}
                            }
                            msg.edit(RESULT);
                        });
                        break;
                }
            });
        } else {
            const description = Object.assign({
                content: 'No description available.',
                usage: '',
                examples: [],
                fields: []
            }, command.description);
    
            const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`\`${this.handler.prefix[0]}${command.aliases[0]} ${description.usage}\``)
                .addField('Description', description.content);
    
            for (const field of description.fields) embed.addField(field.name, field.value);
    
            if (description.examples.length) {
                const text = `${this.handler.prefix[0]}${command.aliases[0]}`;
                embed.addField('Examples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
            }
    
            if (command.aliases.length > 1) {
                embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
            }
    
            return message.util.send({ embed });

            //#region old
            //         let Embed = this.client.util.embed()
    //             .setTitle("Help | Command Result")
    //             .addField(
    //                 command.id,
    //                 stripIndents`
    //   **\\>** Name: **${command.id}**
    //   **\\>** Aliases: **${command.aliases.join("**, **")}**
    //   **\\>** Cooldown: **TODO**
    //   **\\>** Description: **${command.description}**
    //   ${command.ownerOnly ? "**Developer Only!**" : ""}`
    //             )

    //             // insert at TODO above ${ms(command.cooldown ?? this.handler.defaultCooldown, { long: true } )}

    //             .setFooter(`Requested by: ${message.author.tag}`)
    //             .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
    //             .setTimestamp();
    //         message.channel.send(Embed);
//#endregion
        }
    }
}