const { Command } = require('discord-akairo');
const { get } = require('axios');
const moment = require('moment');
const Logger = require('../../util/logger.js');

module.exports = class TestCommand extends Command {
   constructor() {
	   super('memebomb', {
			aliases: ['meme-bomb', 'm-bomb', 'bomb-meme', 'five-meme','five-memes', '5-meme', '5-memes'],
			category: 'Reddit',
			userPermissions: [],
			clientPermissions: ['MANAGE_WEBHOOKS', 'EMBED_LINKS'],
			ignorePermissions: [],
			cooldown: 0,
			ratelimit: 1,
			ignoreCooldown: [],
			ownerOnly: false,
			description: {
			   content: 'Sends 5 memes at once! Can be very slow tho.',
			   usage: ''
		   },
	   })
   }

	async exec(message, args) {
        message.delete({ timeout: 5000 });
        let subredditArr = await this.randomFromArray(['memes', 'dankmemes']);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        let post1 = await this.getReddit(subredditArr);
        let srcPostURL1 = post1.url;
        let srcURL1 = srcPostURL1.replace('.gifv', '.gif');

        while (post1.is_video || post1.over_18 || !post1.post_hint === 'image' || post1.stickied) {
            post1 = await this.getReddit(subredditArr);
        }

        let embed1 = this.client.util.embed()
        .setTitle(post1.title)
        .setURL(`https://reddit.com${post1.permalink}`)
        .setImage(srcURL1)
        .setColor('RANDOM')
        .setFooter(`👍 ${post1.ups} | 👤 u/${post1.author} | 📆 ${moment.unix(post1.created).format('DD MMM YYYY')}`, message.author.avatarURL({dynamic: true}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        let post2 = await this.getReddit(subredditArr);
        let srcPostURL2 = post2.url;
        let srcURL2 = srcPostURL2.replace('.gifv', '.gif');

        while (post2.is_video || post2.over_18 || !post2.post_hint === 'image' || post2.stickied) {
            post2 = await this.getReddit(subredditArr);
        }

        let embed2 = this.client.util.embed()
        .setTitle(post2.title)
        .setURL(`https://reddit.com${post2.permalink}`)
        .setImage(srcURL2)
        .setColor('RANDOM')
        .setFooter(`👍 ${post2.ups} | 👤 u/${post2.author} | 📆 ${moment.unix(post2.created).format('DD MMM YYYY')}`, message.author.avatarURL({dynamic: true}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let post3 = await this.getReddit(subredditArr);
        let srcPostURL3 = post3.url;
        let srcURL3 = srcPostURL3.replace('.gifv', '.gif');

        while (post3.is_video || post3.over_18 || !post3.post_hint === 'image' || post3.stickied) {
            post3 = await this.getReddit(subredditArr);
        }

        let embed3 = this.client.util.embed()
        .setTitle(post3.title)
        .setURL(`https://reddit.com${post3.permalink}`)
        .setImage(srcURL3)
        .setColor('RANDOM')
        .setFooter(`👍 ${post3.ups} | 👤 u/${post3.author} | 📆 ${moment.unix(post3.created).format('DD MMM YYYY')}`, message.author.avatarURL({dynamic: true}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let post4 = await this.getReddit(subredditArr);
        let srcPostURL4 = post4.url;
        let srcURL4 = srcPostURL4.replace('.gifv', '.gif');

        while (post4.is_video || post4.over_18 || !post4.post_hint === 'image' || post4.stickied) {
            post4 = await this.getReddit(subredditArr);
        }

        let embed4 = this.client.util.embed()
        .setTitle(post4.title)
        .setURL(`https://reddit.com${post4.permalink}`)
        .setImage(srcURL4)
        .setColor('RANDOM')
        .setFooter(`👍 ${post4.ups} | 👤 u/${post4.author} | 📆 ${moment.unix(post4.created).format('DD MMM YYYY')}`, message.author.avatarURL({dynamic: true}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let post5 = await this.getReddit(subredditArr);
        let srcPostURL5 = post5.url;
        let srcURL5 = srcPostURL5.replace('.gifv', '.gif');

        while (post5.is_video || post5.over_18 || !post5.post_hint === 'image' || post5.stickied) {
            post5 = await this.getReddit(subredditArr);
        }

        let embed5 = this.client.util.embed()
        .setTitle(post5.title)
        .setURL(`https://reddit.com${post5.permalink}`)
        .setImage(srcURL5)
        .setColor('RANDOM')
        .setFooter(`👍 ${post5.ups} | 👤 u/${post5.author} | 📆 ${moment.unix(post5.created).format('DD MMM YYYY')}`, message.author.avatarURL({dynamic: true}));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		let channel = message.channel;
		try {
			let webhook;
			channel.fetchWebhooks()
			.then(hooks => {
				if(hooks.size == 0) {
					channel.createWebhook(this.client.user.username, {
						avatar: this.client.user.avatarURL({dynamic: true}),
					}).then(hook => hook.send({
						username: this.client.user.username,
						avatarURL: this.client.user.avatarURL(),
						embeds: [embed1, embed2, embed3, embed4, embed5],
					}))
				}
				else {
					let hook = hooks.first();
					hook.send({
						username: this.client.user.username,
						avatarURL: this.client.user.avatarURL(),
						embeds: [embed1, embed2, embed3, embed4, embed5],
					})
				}
			});
		} catch (error) {
			console.error('Error trying to send: ', error);
		}
    }

    /**
    * Validates, if a subreddit exists and returns it
    * @param {String} subreddit
    */
    async getReddit(subreddit) {
        let sub = subreddit.replace('r/', '');
        const res = await get(`https://www.reddit.com/r/${sub}/top.json?t=month`);
        if (res.length === 0) {
            return false;
        } else {
            let max = [];
            max = res.data.data.children.map(i => i.data.ups);

            const rand = Math.floor(Math.random() * max.length);
            const post = res.data.data.children.filter(i => i.data.ups === max[rand]);

            return post[0].data;
        }
    }

    /**
    * Get a random item out of an array
    * @param {Array} array
    */
    async randomFromArray(array) {
        if (Array.isArray(array)) {
            return array[Math.floor(Math.random() * array.length)];
        }
    }

}