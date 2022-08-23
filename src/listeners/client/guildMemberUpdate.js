const { Listener } = require('@sapphire/framework');
const { Permissions } = require('discord.js');

module.exports = class GuildMemberUpdateListener extends Listener {
    constructor(context, options = {}) {
        super(context, {
            once: true,
            event: "guildMemberUpdate"
        });
    }

    run(oldmember, newmember) {
        //#region auto remove nickname
        let target = 'x';

        if (oldmember.user.id == target) {
            if (oldmember.nickname !== newmember.nickname) {
                if (newmember.nickname !== null) {
                    newmember.setNickname(null, `No nickname for ${newmember.user.tag}!`).catch(err => { console.log(err); });
                }
            }
        }
        //#endregion

        
    }
}
