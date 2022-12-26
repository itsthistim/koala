const { Command, CommandOptionsRunTypeEnum, BucketScope } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');

module.exports = class HelpCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'help',
            aliases: ['help', 'h'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Shows a command or this list.',
                usage: '[command]',
                examples: ['', 'ping']
            }
        });
    }

    async messageRun(message, args) {
        var input = await args.pick('string').catch(() => { null; });
        var cmd = this.container.stores.get('commands').get(input);

        var prefix = this.container.client.options.defaultPrefix[0];

        if (!cmd) {
            const commands = this.container.client.stores.get('commands');
            commands.sort();

            const categories = commands.map(c => c.category).filter((v, i, a) => a.indexOf(v) === i);

            const myPaginatedMessage = new PaginatedMessage({
                template: new MessageEmbed()
                    .setColor(COLORS.DEFAULT)
                    .setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() })
            });

            myPaginatedMessage.addPageEmbed((embed) => {

                embed.setTitle('Help');
                embed.setDescription(`Use \`${prefix}help [command]\` to get more information about a command.`);
                embed.setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() });

                return embed;
            });

            for (const category of categories) {
                const categoryCommands = commands.filter(c => c.category === category);

                if (category != '_Developer' && category != 'Music_old') {
                    myPaginatedMessage.addPageEmbed((embed) => {
                        embed.setTitle(category);
                        embed.setDescription(`${categoryCommands.map(c => {
                            return `\`${prefix}${c.name}\` - ${c.description.content}`;
                        }).join('\n')}`);

                        embed.setFooter({ text: this.container.client.user.username, iconURL: this.container.client.user.displayAvatarURL() });

                        return embed;
                    });
                }
            }

            await myPaginatedMessage.run(message);
        }
        else {
            const embed = new MessageEmbed()
                .setColor(COLORS.DEFAULT)
                .setTitle(`\`${prefix}${cmd.name}${cmd.description.usage !== '' ? ' ' + cmd.description.usage : ''}\``)
                .addFields({ name: 'Description', value: `${cmd.description.content}${cmd.detailedDescription ? `\n${cmd.detailedDescription}` : ''}` });

            if (cmd.description.examples?.length > 0) {
                embed.addFields({ name: 'Examples', value: `\`${prefix}${cmd.name} ${cmd.description.examples.join(`\`\n\`${prefix}${cmd.name} `)}\`` }, true);
            }

            if (cmd.aliases.length > 1) {
                embed.addFields({ name: 'Aliases', value: `\`${cmd.aliases.join('` `')}\`` }, true);
            }

            if (cmd.options.requiredUserPermissions?.length > 0) {
                embed.addFields({ name: 'Required User Permissions', value: `\`${cmd.options.requiredUserPermissions.join('` `')}\`` });
            }

            return reply(message, { embeds: [embed] });
        }
    }
};
