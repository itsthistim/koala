const { Command } = require('@sapphire/framework');
const { send, reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');

module.exports = class KPDBansCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'kpdbans',
            aliases: ['kpd-bans', 'kpdbans', 'krunker-bans', 'krunkerbans', 'tim-bans', , 'timbans', 'kpd'],
            requiredUserPermissions: ['MANAGE_MESSAGES'],
            requiredClientPermissions: [],
            preconditions: ['ownerOnly'],
            subCommands: [],
            flags: [],
            options: [],
            nsfw: false,
            description: {
                content: 'Shows all the bans issued by tim within the last 24 hours.',
                usage: '',
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
        const bans = await get(`https://api.kpdclient.com/user_statistics_bans_issued_report.php?token=${process.env.KPD_TOKEN}&duration_hours=24`).catch(() => { });
        return reply(message, bans ? `Tim tagged ${bans.data.match(/\d+/g)[1]} suspects in the last 24 hours.` : 'An error occurred while fetching the bans.');
    }
}