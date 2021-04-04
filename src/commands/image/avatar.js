const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class AvatarCommand extends Command {
    constructor() {
        super('avatar', {
            aliases: ['avatar'],
            category: 'Image',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Shows the avatar of a guild member.',
                usage: '<member>'
            },
        })
    }

    *args() {
        const guildMember = yield {
            type: 'member',
            match: 'phrase',
            default: msg => msg.guild.members.cache.get(msg.author.id),
            prompt: {
                start: 'Who do you want to view the avatar of?',
                retry: 'Please provide a valid member. Try again!',
                optional: true
            }
        };
        
        return { guildMember };
    }

    async exec(msg, { guildMember }) {
        const embed = this.client.util.embed()
        .setAuthor(guildMember.user.username + "#" + guildMember.user.discriminator, guildMember.user.displayAvatarURL({ dynamic: true }))
        .setImage(guildMember.user.displayAvatarURL({ dynamic: true, size: 1024 }));

        return msg.util.send(embed);
    }
}