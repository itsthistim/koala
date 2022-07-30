const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed, MessageAttachment, Attachment } = require('discord.js');
const PasteGG = require("paste.gg");

module.exports = class IntervalTask extends ScheduledTask {
    constructor(context, options) {
        super(context, {
            ...options,
            interval: 1 * Time.Month
        });
    }

    async run() {
        const guild = this.container.client.guilds.cache.get('988912269909966938');
        const channel = guild.channels.cache.get('988925360332755004');

        const idiotRole = guild.roles.cache.get('999792913569558658');
        const idiots = guild.members.cache.filter(member => member.roles.cache.has(idiotRole.id));
        const idiotList = idiots.map(member => member.user.tag).join('\n');

        const msg = `This month there has been **${idiots.size} idiots**.\nNone of them can count and they should be ashamed of themselves.\nHere they are:`;
        
        const paste = await this.getPaste(idiotList, 'Idiots');
        const attachment = {
            attachment: Buffer.from(idiotList),
            name: 'idiots.txt',
            description: 'Idiots that can\'t count.'
        }

        // channel.send({ content: msg + paste});
        channel.send({ content: msg, files: [attachment] });

        // remove role from idiots
        idiots.forEach(member => {
            member.roles.remove(idiotRole).catch(err => console.log(err));
        });

        console.log("Ran idiot task");
    }

    async getPaste(value) {
        try {
            const client = new PasteGG();
            let paste = await client.post({
                name: 'Idiots',
                expires: new Date(Date.now() + Time.Month * 1),
                description: 'Idiots that can\'t count.',
                files: [{
                    name: 'Idiots',
                    content: {
                        format: 'text',
                        value: value
                    }
                }]
            })

            return `\n${paste.result.url}`
        } catch (err) {
            return `\n${err}`;
        }
    }
}