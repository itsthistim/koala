const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class ProfitCommand extends Command {
    constructor(context, options) {
        super(context, {
            name: 'profit',
            aliases: ['profit'],
            requiredUserPermissions: [],
            requiredClientPermissions: [],
            preconditions: [],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Calculates profit made from the sauce market.',
                usage: '<bought for> <sells for> <amount>',
                examples: ['']
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
        var oldPrice = await args.pick('integer').catch(() => null);
        var newPrice = await args.pick('integer').catch(() => null);
        var amount = await args.pick('integer').catch(() => null);

        if (!oldPrice) return message.reply('Please provide the old price.');
        if (!newPrice) return message.reply('Please provide the new price.');
        if (!amount || amount <= 0) return message.reply('Please provide the amount.');

        return reply(message, `Bought ${amount} sauce${amount > 1 ? 's' : ''} for ${oldPrice * amount}$ and sold for ${newPrice * amount}$ for a profit of **${amount * (newPrice - oldPrice)}$**.`);
    }
}