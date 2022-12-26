const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class FilterCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'filter',
            aliases: ['filter', 'filters', 'setfilter'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Puts a filter over the queue.',
                usage: '<filter|off>',
                examples: ['bassboost nightcore', 'reverse']
            },
            detailedDescription: `\nPossible Filters:\n- off\n- 3d\n- bassboost\n- nightcore\n- vaporwave\n- reverse\n- echo\n- gate\n- flanger\n- haas\n- karaoke\n- mcompand\n- phaser\n- tremolo\n- surround\n- earwax`
        });
    }

    // registerApplicationCommands(registry) {
    //     registry.registerChatInputCommand((builder) => {
    //         builder.setName(this.name)
    //         builder.setDescription(this.description.content)
    //     }, {
    //         //idHints: ''
    //     })
    // }

    // async chatInputRun(interaction) {

    // }

    async messageRun(message, args) {
        var filter = await args.rest('string').catch(() => null);

        const queue = this.container.client.distube.getQueue(message)
        if (!queue) return reply(message, 'There is nothing playing right now!');
        if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

        if (filter == 'off') filter = false;//queue.setFilter(false);

        if (Object.keys(this.container.client.distube.filters).includes(filter) || filter === false) {
            queue.setFilter(filter)
        } else if (filter) {
            return message.channel.send(`Not a valid filter.`);
        }

        message.channel.send(`Current Queue Filter: \`${queue.filters.join(', ') || 'Off'}\``)
    }
}