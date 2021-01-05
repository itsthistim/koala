const { Command } = require('discord-akairo');

class RollCommand extends Command {
    constructor() {
        super('roll', {
            aliases: ['roll', 'dice', 'dice-roll', 'roll-dice'],
            category: 'Random',
            args: [
                {
                    id: 'amount',
                    type: 'integer',
                    default: 6
                }
            ]
        });
    }

    exec(message, args) {
        const res = Math.floor(Math.random() * args.amount) + 1;
        return message.reply(`You rolled ${res}!`);
    }
}

module.exports = RollCommand;