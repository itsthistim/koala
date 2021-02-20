const { Command } = require('discord-akairo');
const util = require('util');

const tags = require('common-tags');
const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');
const escapeRegex = require('escape-string-regexp');
const discord = require('discord.js');


module.exports = class CommandoEvalCommand extends Command {
	constructor() {
		super('commando-eval', {
			aliases: ['commando-eval'],
			ownerOnly: true,
			quoted: false,
			args: [
				{
					id: 'code',
					match: 'content'
				}
			],
			description: {
				content: 'Evaluates code.',
				usage: '<code>'
			}
		});
	}

	async exec(msg, args) {
		const doReply = val => {
			if(val instanceof Error) {
				msg.util.reply(`Callback error: \`${val}\``);
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
				if(Array.isArray(result)) {
					for(const item of result) {
						if(this.client.options.selfbot) msg.util.send(item); else msg.util.reply(item);
					}
				} else if(this.client.options.selfbot) {
					msg.util.send(result);
				} else {
					msg.util.reply(result);
				}
			}
		};

		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(args.code);
			hrDiff = process.hrtime(hrStart);
		} catch(err) {
			return msg.util.reply(`Error while evaluating: \`${err}\``);
		}

		this.hrStart = process.hrtime();
		let response = this.makeResultMessages(this.lastResult, hrDiff, args.code, msg.editable);
		if(msg.editable) {
			if(response instanceof Array) {
				if(response.length > 0) response = response.slice(1, response.length - 1);
				for(const re of response) msg.util.send(re);
				return null;
			} else {
				return msg.edit(response);
			}
		} else {
			return msg.util.reply(response);
		};
	};
    
    makeResultMessages(result, hrDiff, input = null, editable = false) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if(input) {
			return discord.splitMessage(tags.stripIndents`
				${editable ? `
					*Input*
					\`\`\`javascript
					${input}
					\`\`\`` :
				''}
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		} else {
			return discord.splitMessage(tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, 1900, '\n', prepend, append);
		}
	}

	get sensitivePattern() {
		if(!this._sensitivePattern) {
			const client = this.client;
			let pattern = '';
			if(client.token) pattern += escapeRegex(client.token);
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
		}
		return this._sensitivePattern;
	}
}