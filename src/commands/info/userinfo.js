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
        
        if (target) {
            const status = {
                online: "<:online:580819575742922753>",
                idle: "<:idle:580819575088742413>",
                dnd: "<:dnd:580819574816112640>",
                streaming: "<:streaming:613525444808933379>",
                offline: "<:offline:580819575319560243>"
            };

            let emojiExists = this.client.emojis.cache.some(emoji => emoji.id === target.presence.activities[0].emoji.id);

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
                .setDescription( `${status[guildmember.presence.status]}${guildmember}${userstatus ? " - " + emojiExists ? this.client.emojis.cache.get(target.presence.activities[0].emoji.id).toString() : "" + userstatus : ''}`)
                .setThumbnail(guildmember.user.displayAvatarURL({dynamic: true, size: 2048}))
                .addField(`Joined Server`, `${moment.utc(guildmember.joinedAt).format('MMMM Do YYYY')}\n(${moment.utc(guildmember.joinedAt).fromNow()})`, true)
                .addField(`Joined Discord`, `${moment.utc(guildmember.createdAt).format('MMMM Do YYYY')}\n(${moment.utc(guildmember.createdAt).fromNow()})`, true)
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