const { Command } = require('discord-akairo');
const Logger = require('../../util/logger.js');

module.exports = class IntervalCommand extends Command {
    constructor() {
        super('interval', {
            aliases: ['interval'],
            category: '',
            userPermissions: [],
            clientPermissions: [],
            ignorePermissions: [],
            cooldown: 0,
            ratelimit: 1,
            ownerOnly: false,
            description: {
                content: 'No description provided.',
                usage: 'cooldown amount text'
            },
        })
    }

*args() {

    const amount = yield {
        type: 'integer',
        match: 'phrase',
        prompt: {
            start: 'How many seconds of cooldown should there be between the messages?',
            retry: 'Please provide a valid cooldown. Try again!',
            optional: true,
            default: 5
        }
    };

    const cooldown = yield {
        type: 'integer',
        match: 'phrase',
        prompt: {
            start: 'How many times do you want to send the message?',
            retry: 'Please provide a valid amount. Try again!',
            optional: true,
            default: 5
        }
    };

    const text = yield {
        type: 'text',
        match: 'rest',
        prompt: {
            start: 'What text do you want to send?',
            retry: 'Please provide a valid text. Try again!',
            optional: false
        }
    };
    
    return { amount, text };
}

async exec(msg, args) {
        msg.channel.send(args.text);
        
        var i = 3;
        var interval = setInterval(function() {
            if (i > args.amount) {
                clearInterval(interval);
            }
            msg.channel.send(args.text);
            i = i + 1;
        }, args.cooldown*1000);
    }
}