const { Command, Argument } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment');

module.exports = class UserInfoCommand extends Command {
    constructor() {
        super('user-info', {
            aliases: ['user-info', 'who-is', 'who'],
            category: 'Info',
            args: [
                {
                    id: 'target',
                    match: 'phrase',
                    type: Argument.union('member', 'user'),
                    default: msg => msg.author,
                    unordered: false,
                    prompt: {
                        start: 'Please provide a valid user.',
                        retry: 'Please provide a valid user. Try again!',
                        optional: true
                    }
                }
            ],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
               content: 'Shows info about any user.',
               usage: '<user>'
            },
        })
    }

    async exec(msg, { target }) {
        const guild = msg.guild;
        const status = {
            online: "<:online:861986701580697670> ",
            idle: "<:idle:861986831541207042>",
            dnd: "<:dnd:861986768517070938> ",
            streaming: "<:streaming:861986871578722364>",
            offline: "<:offline:861986750952112189> "
        };
        
        if (target) {
            let usergame;
            let userstatus;
            for (let i = target.presence.activities.length - 1; i >= 0; i--) {
                if (target.presence.activities[i].type == 'CUSTOM_STATUS') {
                    userstatus = target.presence.activities[i].state;
                }
                else if (target.presence.activities[i].type == 'PLAYING') {
                    usergame = target.presence.activities[i].name;
                }
            }

            if (guild.member(target.id)) {
                msg.guild.roles.cache.sort(function(x, y) {
                    return y.position - x.position
                });

                let guildmember = msg.guild.members.cache.get(target.id);

                const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`Let me check the archives!`)
                .setAuthor(guildmember.user.username + '#' + guildmember.user.discriminator, guildmember.user.displayAvatarURL({dynamic: true}))
                .setDescription( `${status[guildmember.presence.status]}${guildmember}`)
                .setThumbnail(guildmember.user.displayAvatarURL({dynamic: true, size: 2048}))
                .addField(`Joined Server`, `${moment.utc(guildmember.joinedAt).format('MMMM Do YYYY')}\n(${moment.utc(guildmember.joinedAt).fromNow()})`, true)
                .addField(`Joined Discord`, `${moment(guildmember.createdAt).format('MMMM Do YYYY')}\n(${moment(guildmember.createdAt).fromNow()})`, true)
                .addField('\u200b', '\u200b', true)
                .addField(`Playing`,`${usergame ? usergame : "Nothing"}`, true)
                .addField(`Last message`, `${guildmember.lastMessage ? `[${guildmember.lastMessage.content}](${guildmember.lastMessage.url})` : "none"}`, true)
                .addField('\u200b', '\u200b', true)
                .addField(`Roles`, `${guildmember.roles.cache.map(roles => `${roles}`).join(' ')}`)
                .setFooter(`Member ID: ${guildmember.id}`);
                msg.util.send({ embed });
            }
            else {
                const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`Let me check the archives!`)
                .setAuthor(target.username + '#' + target.discriminator, target.displayAvatarURL({dynamic: true}))
                .setDescription(`${status[target.presence.status]}${target}${userstatus ? ' - ' + emojiExists ? this.client.emojis.cache.get(target.presence.activities[0].emoji.id).toString() : "" + userstatus : ''}`)
                .setThumbnail(`${target.displayAvatarURL({dynamic: true})}`)
                .addField(`Joined Discord`, `${moment.utc(target.createdAt).fromNow()}.`, true)
                .addField(`Playing`,`${usergame ? usergame : "Nothing"}`, true)
                .setFooter(`User ID: ${target.id}`);
                msg.util.send(embed);
            }
        }
    }
}
