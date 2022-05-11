const { Listener } = require('@sapphire/framework');
const { Permissions } = require('discord.js');

module.exports = class GuildMemberUpdateListener extends Listener {
    constructor(context, options = {}) {
        super(context, {
            ...options,
            once: true,
            event: "guildMemberUpdate"
        });
    }

    run(oldmember, newmember) {
        let target = 'x';

        if (oldmember.user.id == target) {
            if (oldmember.nickname !== newmember.nickname) {
                if (newmember.nickname !== null) {
                    newmember.setNickname(null, `No nickname for ${newmember.user.tag}!`).catch(err => { console.log(err); });
                }
            }
        }
    }
}