const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class QueueCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'queue',
            aliases: ['queue'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Play a song in a voice channel.',
                usage: '<query>',
                examples: ['bitch lasagna']
            },
            detailedDescription: ''
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
        const queue = this.container.client.distube.getQueue(message);
        if (!queue) return message.channel.send(`There is nothing in the queue.`);

        const q = queue.songs.map((song, i) => `${i === 0 ? 'Playing:' : `**${i}.**`} **[${song.name}](${song.url})** \`(${song.formattedDuration})\`${i === 0 ? '\n' : ''}`).join('\n');

        message.channel.send({
            embeds: [{
                title: `Queue`,
                description: q,
                color: COLORS.DEFAULT
            }]
        })
    }
}