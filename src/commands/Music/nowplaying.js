const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class NowPlayingCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'now-playing',
            aliases: ['now-playing', 'nowplaying', 'np'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Shows which song is currently playing.',
                usage: '',
                examples: []
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
        if (!queue) return message.channel.send(`${EMOJIS.NEGATIVE} | There is nothing in the queue right now!`)
        const song = queue.songs[0]
        message.channel.send({
            embeds: [{
                title: `Now playing`,
                description: `**[${song.name}](${song.url})** \`(${song.formattedDuration})\` - ${song.user}`,
                thumbnail: {
                    url: `${song.thumbnail}`
                },
                color: COLORS.GREEN
            }]
        })
    }
}