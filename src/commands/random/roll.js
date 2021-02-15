const { Command, Argument } = require('discord-akairo');
const { Random } = require("random-js");

module.exports = class RollCommand extends Command {
    constructor() {
        super('roll', {
            aliases: ['roll', 'dice', 'dice-roll', 'roll-dice'],
            category: 'Random',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'Roll one die or multiple dice with a given amount of sides.',
                usage: '[sides] [amount of dice]'
            },
        });
    }

    *args() {
        const sides = yield {
            type: Argument.range('integer', 1, 9007199254740992, true),
            match: 'phrase',
            prompt: {
                start: 'How many sides should the die or dices have?',
                retry: 'Please provide a valid number for the sides. Try again!',
                optional: true
            },
            default: 6
        };

        const diceCount = yield {
            type: Argument.range('integer', 1, 20, true), 
            match: 'phrase',
            prompt: {
                start: 'How many dice do you want to throw?',
                retry: 'Please provide a valid amount. You can only throw 20 dice at once. Try again!',
                optional: true
            },
            default: 1
        };
        
        return { sides, diceCount };
    }

    async exec(msg, { sides, diceCount }) {
        
        const random = new Random();
        const score = random.dice(sides, diceCount);

        try {            
            let res = '';
            let total = 0;

            for (let i = 0; i < score.length; i++) {
                if (diceCount == 1) {
                    res = `You rolled \`${score[i]}\``;
                }
                else {
                    res += `Dice ${i + 1}: \`${score[i]}\`\n`;
                    total += score[i];
                }
            }

            let e = this.client.util.embed()
            .setTitle(`Rolled ${diceCount} ${diceCount == 1 ? 'die' : 'dice'}:`)
            .setDescription(res);

            if (diceCount > 1) {
                e.setFooter(`Total: ${total}`);
            }

            return msg.util.send(e);
        } catch (error) {
            let res = '';

            for (let i = 0; i < score.length; i++) {
                if (diceCount == 1) {
                    res = `You rolled \`${score[i]}\``;
                }
                else {
                    res += `Dice ${i + 1}: \`${score[i]}\`\n`;
                }
            }

            let e = this.client.util.embed()
            .setTitle(`Rolled ${diceCount} ${diceCount == 1 ? 'die' : 'dice'}:`)
            .setDescription(res);

            return msg.util.send(e);
        }
    }
}