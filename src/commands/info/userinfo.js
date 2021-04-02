const { Command, Argument } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment');

module.exports = class UserInfoCommand extends Command {
    constructor() {
        super('user-info', {
            aliases: ['user-info', 'who-is', 'who'],
            category: 'Lookup',
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

        const status = {
            online: "<:online:580819575742922753>",
            idle: "<:idle:580819575088742413>",
            dnd: "<:dnd:580819574816112640>",
            streaming: "<:streaming:613525444808933379>",
            offline: "<:offline:580819575319560243>"
        };
        const guild = msg.guild;
        
        if (target) {
            if (guild.member(target.id)) {
                msg.guild.roles.cache.sort(function(x, y) {
                    return y.position - x.position
                });

                let guildmember = msg.guild.members.cache.get(target.id);
                let usergame;
                let userstatus;

                for (let i = guildmember.presence.activities.length - 1; i >= 0; i--) {
                    if (guildmember.presence.activities[i].type == 'CUSTOM_STATUS') {
                        userstatus = guildmember.presence.activities[i].state;
                    }
                    else if (guildmember.presence.activities[i].type == 'PLAYING') {
                        usergame = guildmember.presence.activities[i].name;
                    }
                }

                const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`Let me check the archives!`)
                .setAuthor(guildmember.user.username + '#' + guildmember.user.discriminator, guildmember.user.displayAvatarURL({dynamic: true}))
                .setDescription(`${status[guildmember.presence.status]}${guildmember} ${userstatus ? userstatus : ' '}`)
                .setThumbnail(guildmember.user.displayAvatarURL({dynamic: true, size: 2048}))
                //.addField(`Nickname`,`${guildmember.nickname ? `${guildmember.nickname}` : '\`No nickname\`'}`, true)
                .addField(`Joined Server`, `${moment.utc(guildmember.joinedAt).format('MMMM Do YYYY')}\n(${moment.utc(guildmember.joinedAt).fromNow()})`, true)
                .addField(`Joined Discord`, `${moment.utc(guildmember.createdAt).format('MMMM Do YYYY')}\n(${moment.utc(guildmember.createdAt).fromNow()})`, true)
                .addField('\u200b', '\u200b', true)
                .addField(`Game`,`${usergame ? usergame : "\`none\`"}`, true)
                .addField(`Last message`, `${guildmember.lastMessage ? `[${guildmember.lastMessage.content}](${guildmember.lastMessage.url})` : "\`none\`"}`, true)
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
                .setDescription(`${target}.`)
                .setThumbnail(`${target.displayAvatarURL({dynamic: true})}`)
                .addField("Status", `${status[target.presence.status]}`, true)
                .addField(`Joined Discord`, `${moment.utc(target.createdAt).fromNow()}.`, true)
                .addField(`Game`,`${target.presence.game ? guildmember.presence.game.name : 'None'}`, true)
                .setFooter(`User ID: ${target.id}`);
                msg.util.send(embed);
            }
        }
    }
}