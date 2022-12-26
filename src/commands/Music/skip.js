const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class SkipCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'skip',
            aliases: ['s', 's'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Skips the current song.',
                usage: '[index]',
                examples: []
            },
            detailedDescription: '\nYou can also skip to a given index in the queue.\nFor example skipping to the 3rd song of the queue with \`skip 3\`'
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
        var index = await args.rest('number').catch(() => null);
        if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

        const queue = this.container.client.distube.getQueue(message);
        if (!queue) return message.channel.send(`There is nothing in the queue right now!`);

        if (!index) {
            queue.skip();
        } else {
            if (isNaN(index)) return reply(message, 'You need to provide a valid index!');
            this.container.client.distube.jump(message, index);
        }
    }
}