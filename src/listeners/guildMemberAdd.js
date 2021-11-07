const { Listener } = require('discord-akairo');
const Logger = require('../util/logger.js');;
const dr = require('discord-reply');

module.exports = class GuildMemberAddListener extends Listener {
	constructor() {
		super('guildMemberAdd', {
			event: 'guildMemberAdd',
			emitter: 'client'
		});
	}

	async exec(joinedMember) {
        
        const MEMBERS = ['319183644331606016', '299257362378915840', '533281498724564992', '534356167502069760', '667050089398665227']; // tim, nova, latte, mondra, pop
        const MEMBER_ROLE = member.guild.roles.cache.find(role => role.name === "Members");

        if (joinedMember.guild.id == '906292187271143485') {
            if (MEMBERS.includes(joinedMember.id)) {
                joinedMember.roles.add(MEMBER_ROLE);
            }
        }
	}
}