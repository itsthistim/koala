const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class VolumeCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'volume',
            aliases: ['volume', 'vol'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Sets the volume of a song.',
                usage: '<volume>',
                examples: ['100', '75', '10']
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
        var volume = await args.rest('integer').catch(() => null);
        const queue = this.container.client.distube.getQueue(message);
        
        if (!queue) return reply(message, 'There is nothing playing right now!');
        if (!volume) return reply(message, `The current volume is: ${queue.volume}.`)
        if (volume < 1 || volume > 100) return reply(message, 'The volume has to be between 1 and 100!');

        this.container.client.distube.setVolume(message, volume);

        message.react(EMOJIS.POSITIVE);
    }
}