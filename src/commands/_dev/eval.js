const {
    Command
} = require('discord-akairo');
const util = require('util');
const Logger = require('../../util/logger');

module.exports = class EvalCommand extends Command {
    constructor() {
        super('eval', {
            aliases: ['eval', 'e'],
            ownerOnly: true,
            quoted: false,
            description: {
                content: 'Evaluates code.',
                usage: '<code> [-await]'
            }
        });
    }

    *args() {
        const code = yield {
            type: 'string',
            match: 'text',
            prompt: {
                start: 'What do you want to evaluate?',
                retry: 'Please provide a valid code. Try again!',
                optional: false
            }
        };

        const awaitFlag = yield {
            match: 'flag',
            flag: ['--await', '-await', '--a', '-a']
        };
        
        return { code, awaitFlag };
    }

    async exec(message, { code, awaitFlag }) {
        if (!code) {
            return message.util.reply('No code provided!');
        }

        const evaled = {};
        const logs = [];

        const token = this.client.token.split('').join('[^]{0,2}');
        const rev = this.client.token.split('').reverse().join('[^]{0,2}');
        const tokenRegex = new RegExp(`${token}|${rev}`, 'g');
        const cb = '```';

        const print = (...a) => {
            const cleaned = a.map(obj => {
                if (typeof o !== 'string') obj = util.inspect(obj, {
                    depth: 1
                });
                return obj.replace(tokenRegex, '[TOKEN]');
            });

            if (!evaled.output) {
                logs.push(...cleaned);
                return;
            }

            evaled.output += evaled.output.endsWith('\n') ? cleaned.join(' ') : `\n${cleaned.join(' ')}`;
            const title = evaled.errored ? '\u2000:x: **Error**' : 'ðŸ“¤\u2000**Output**';

            if (evaled.output.length + code.length > 1000)

                evaled.output = 'Output too long.';
                evaled.message.edit([
                `${title}${cb}js`,
                evaled.output,
                cb
            ]);
        };

        try {
            let output;

            if (awaitFlag) {
                output = eval(`(async() => { ${code} })()`);
            }
            else {
                output = eval(code);
            }

            if (output != null && typeof output === 'function') output = output

            if (typeof output !== 'string') output = util.inspect(output, {
                depth: 0
            });

            output = `${logs.join('\n')}\n${logs.length && output === 'undefined' ? '' : output}`;
            output = output.replace(tokenRegex, '[TOKEN]');
            if (output.length > 1900) {
                let r = await sfetch.post(`https://hasteb.in/documents`)
                    .set(`Content-Type`, `application/raw`)
                    .send(output)

                const embed = this.client.util.embed()
                    .setDescription(`[Click Here](https://hasteb.in/${r.body.key}) for full output`)

                const sent = await message.util.send([
                    `\u2000${message.author}, :x:**Output**${cb}js`,
                    "Output too long.",
                    cb
                ], embed);

                evaled.message = sent;
                evaled.errored = false;
                evaled.output = output;

                return sent;
            }

            const sent = await message.util.send([
                `\u2000${message.author}, :white_check_mark: **Output**${cb}js`,
                output,
                cb
            ]);

            evaled.message = sent;
            evaled.errored = false;
            evaled.output = output;

            return sent;

        } catch (err) {
            let error = err;
            error = error.toString();
            error = `${logs.join('\n')}\n${logs.length && error === 'undefined' ? '' : error}`;
            error = error.replace(tokenRegex, '[TOKEN]');
            //console.log("Errs " + err.split("\n"))

            const sent = await message.util.send([

                `\u2000${message.author}, :x:**Error**${cb}js`,
                error,
                cb
            ]);

            evaled.message = sent;
            evaled.errored = true;
            evaled.output = error;

            return sent;
        }
    }
}