const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const Logger = require('../../util/logger.js');

module.exports = class TicTacToeCommand extends Command {
    constructor() {
        super('tic-tac-toe', {
            aliases: ['tic-tac-toe', 'tic'],
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: true,
            description: {
                content: 'No description provided.',
                usage: ''
            },
        })

        this.playing = new Set();
    }

    * args() {
        const opponent = yield {
            type: 'member',
            match: 'phrase',
            prompt: {
                start: 'Who do you want to play against?',
                retry: 'Please provide a valid opponent. Try again!',
                optional: false
            }
        };

        return { opponent };
    }

    async exec(msg, { opponent} ) {
        if (opponent.bot) return msg.reply('Bots may not be played against.');
        if (opponent.id === msg.author.id) return msg.reply('You may not play against yourself.');
        if (this.playing.has(msg.channel.id)) return msg.reply('Only one game may be occurring per channel.');

        this.playing.add(msg.channel.id);

        try {
            await msg.util.send(`${opponent}, do you accept this challenge?`);
            const verification = await this.verify(msg.channel, opponent);

            if (!verification) {
                this.playing.delete(msg.channel.id);
                return msg.util.send('Looks like they declined...');
            }

            const sides = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
            const taken = [];

            let userTurn = true;
            let winner = null;

            while (!winner && taken.length < 9) {
                const user = userTurn ? msg.author : opponent;
                const sign = userTurn ? 'X' : 'O';

                let e = this.client.util.embed()
                    .setDescription(stripIndents`\`\`\`
                    ${sides[0]} | ${sides[1]} | ${sides[2]}
                    —————————
                    ${sides[3]} | ${sides[4]} | ${sides[5]}
                    —————————
                    ${sides[6]} | ${sides[7]} | ${sides[8]}
                    \`\`\``);

                await msg.util.send(`${user}, which field do you pick?`, {embed: e});

                const turn = await msg.channel.awaitMessages(res => res.author.id === user.id, {
                    max: 1,
                    time: 30000
                });

                if (!turn.size) {
                    //await msg.channel.send('Sorry, time is up!');
                    userTurn = !userTurn;
                    continue;
                }
                
                const choice = turn.first().content.toLowerCase();
                
                if (choice === 'end') break;
                if (taken.includes(choice)) {
                    await msg.channel.send('That spot is already taken!').then(message => message.delete( {timeout: 5000 } ));
                } else if (!sides.includes(choice)) {
                    await msg.channel.send('I don\'t think that is a valid spot...').then(message => message.delete( {timeout: 5000 } ));
                } else {
                    sides[Number.parseInt(choice, 10)] = sign;
                    taken.push(choice);
                    if (
                        (sides[0] === sides[1] && sides[0] === sides[2]) ||
                        (sides[0] === sides[3] && sides[0] === sides[6]) ||
                        (sides[3] === sides[4] && sides[3] === sides[5]) ||
                        (sides[1] === sides[4] && sides[1] === sides[7]) ||
                        (sides[6] === sides[7] && sides[6] === sides[8]) ||
                        (sides[2] === sides[5] && sides[2] === sides[8]) ||
                        (sides[0] === sides[4] && sides[0] === sides[8]) ||
                        (sides[2] === sides[4] && sides[2] === sides[6])
                    ) winner = userTurn ? msg.author : opponent;
                    userTurn = !userTurn;
                }
            }

            this.playing.delete(msg.channel.id);
            
            return msg.channel.send(winner ? `Congrats, ${winner}!` : 'Oh... it\'s a tie.');
        } catch (err) {
            this.playing.delete(msg.channel.id);
            throw err;
        }
    }

    async verify(channel, user, time = 30000) {
        const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
        const no = ['no', 'n', 'nah', 'nope'];

        const filter = res => {
			const value = res.content.toLowerCase();
			return res.author.id === user.id && (yes.includes(value) || no.includes(value));
		};
        
        const verify = await channel.awaitMessages(filter, {
			max: 1,
			time
		});
        
        if (!verify.size) return 0;
        
        const choice = verify.first().content.toLowerCase();
        
        if (yes.includes(choice)) return true;
		if (no.includes(choice)) return false;
        
        return false;
    }
}