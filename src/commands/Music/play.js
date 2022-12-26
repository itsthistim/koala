const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class PlayCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'play',
            aliases: ['play'],
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
        var query = await args.rest('string').catch(() => null);

        if (!query) return reply(message, 'You need to specify a song!');
        if (!message.member.voice.channel) return reply(message, 'You need to be in a voice voice channel to run this command!');

        this.container.client.distube.play(message.member.voice.channel, query, {
            member: message.member,
            textChannel: message.channel,
            message
        });
    }
}