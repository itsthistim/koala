const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');
const moment = require('moment');

module.exports = class UserInfoCommand extends Command {
    constructor() {
        super('user-info', {
            aliases: ['user-info', 'who-is', 'who'],
            category: 'Lookup',
            args: [
                {
                    id: 'cuser',
                    match: 'phrase',
                    type: 'user',
                    default: msg => msg.author,
                    unordered: false,
                    prompt: {
                        start: 'Please provide a valid member.',
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
            ignoreCooldown: [],
            ownerOnly: false,
            description: {
               content: 'Shows info about any user.',
               usage: '<user>'
            },
        })
    }

    async exec(msg, { cuser }) {

        const status = {
            online: "<:online:580819575742922753>",
            idle: "<:idle:580819575088742413>",
            dnd: "<:dnd:580819574816112640>",
            streaming: "<:streaming:613525444808933379>",
            offline: "<:offline:580819575319560243>"
        };
        const guild = msg.guild;
        
        if (cuser) {
            if (guild.member(cuser.id)) {

                msg.guild.roles.cache.sort(function(x, y) {
                    return y.position - x.position
                });

                let muser = msg.guild.members.cache.get(cuser.id);

                let usergame;
                let userstatus;

                for (let i = muser.presence.activities.length - 1; i >= 0; i--) {
                    if (muser.presence.activities[i].type == 'CUSTOM_STATUS') {
                        userstatus = muser.presence.activities[i].state;
                    }
                    else if (muser.presence.activities[i].type == 'PLAYING') {
                        usergame = muser.presence.activities[i].name;
                    }
                }


                const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`Let me check the archives!`)
                .setAuthor(cuser.username + '#' + cuser.discriminator, cuser.displayAvatarURL({dynamic: true}))
                .setDescription(`${status[muser.presence.status]}${muser} ${userstatus ? userstatus : ' '}`)
                .setThumbnail(cuser.displayAvatarURL({dynamic: true, size: 2048}))
                //.setImage(cuser.displayAvatarURL({dynamic: true}))
                //.addField(`Nickname`,`${muser.nickname ? `${muser.nickname}` : '\`No nickname\`'}`, true)
                .addField(`Joined Server`, `${moment.utc(muser.joinedAt).format('MMMM Do YYYY')}\n(${moment.utc(muser.joinedAt).fromNow()})`, true)
                .addField(`Joined Discord`, `${moment.utc(cuser.createdAt).format('MMMM Do YYYY')}\n(${moment.utc(cuser.createdAt).fromNow()})`, true)
                .addField('\u200b', '\u200b', true)
                .addField(`Game`,`${usergame ? usergame : "\`none\`"}`, true)
                .addField(`Last message`, `${muser.lastMessage ? `[${muser.lastMessage.content}](${muser.lastMessage.url})` : "\`none\`"}`, true)
                .addField('\u200b', '\u200b', true)
                .addField(`Roles`, `${muser.roles.cache.map(roles => `${roles}`).join(' ')}`)
                .setFooter(`Member ID: ${muser.id}`);
                msg.util.send({ embed });
            }
            else {
                const embed = this.client.util.embed()
                .setColor(global.gcolors[0])
                .setTitle(`Let me check the archives!`)
                .setAuthor(cuser.username + '#' + cuser.discriminator, cuser.displayAvatarURL({dynamic: true}))
                .setDescription(`${cuser}.`)
                .setThumbnail(`${cuser.displayAvatarURL({dynamic: true})}`)
                .addField("Status", `${status[cuser.presence.status]}`, true)
                .addField(`Joined Discord`, `${moment.utc(cuser.createdAt).fromNow()}.`, true)
                .addField(`Game`,`${cuser.presence.game ? muser.presence.game.name : 'None'}`, true)
                .setFooter(`User ID: ${cuser.id}`);
                msg.util.send(embed);
            }
        }
    }
}