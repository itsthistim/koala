const { Listener } = require('discord-akairo');
const Logger = require('../util/logger.js');;
const dr = require('discord-reply');
const unscramble = require('unscramble');

class MessageListener extends Listener {
	constructor() {
		super('message', {
			event: 'message',
			emitter: 'client',
			category: 'message'
		});
	}

	async exec(msg) {

	//#region Resurgence Server

	let hamWords = ['ham', 'hamborger', 'hamborgerx', '616801307629453314'];
			let thorWords = ['thorminator', 'dad', 'daddy', '329796755665190914'];
			let xirWords = ['xir', 'xiribidus', '729374984551792651'];
			let walWords = ['wal', 'walrus', 'Walrus5', '467353225104850954'];
			let xavWords = ['x', 'xa', 'xav', 'xavons', '319183644331606016'];
			let agaWords = ['aga', 'agamemnon', 'agame', 'agamne', '346464240703504385'];
			let dragWords = ['drag', 'dragon', 'dragonblazer', 'dragonblazer100', '722198795844059168'];
			let yonnorWords = ['yon', 'yonnor', 'yonnorc', 'yonnorc42', 'yonnor42', '281648176434511873'];
			let mightyWords = ['mighty', 'connor', 'connormurphy', 'murphy', '291385157401706496'];

			if (msg.channel.type == "text") {
				if (msg.guild.id == '752929101412827286') {
					const foundThor = thorWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundXav = xavWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundDrag = dragWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundWal = walWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundAga = agaWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundYonnor = yonnorWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundXir = xirWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundHam = hamWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					const foundMighty = mightyWords.find((word) => {
						const regex = new RegExp(`\\b${word}\\b`, 'i');
						return regex.test(msg.content);
					});

					if (foundXav) {
						msg.react('717915043852845157');
					}

					if (foundThor) {
						//msg.react('779704880792469514'); // purple
						//msg.react('779745006944256010'); // corn
						msg.react('782662912225443841'); // irl pfp
					}

					if (foundWal) {
						//msg.react('779720093608837130'); // wal default
						msg.react('786654445013827616'); // female wal
					}

					if (foundDrag) {
						msg.react('779736525533216829');
					}

					if (foundXir) {
						msg.react('764192509773479977');
					}

					if (foundAga) {
						msg.react('779730263524900875');
					}

					if (foundHam) {
						//msg.react('776204703259951134'); // hamburger
						msg.react('784122296784257075'); // dark monster thing
					}

					if (foundYonnor) {
						msg.react('781222395603451914');
					}

					if (foundMighty) {
						msg.react('788158698199449612');
					}
				}
			}

	//#endregion
		
	//#region Dank Memer Unscrambler
		if (msg.guild == this.client.guilds.cache.get('861359734941810689') /*STSSWCHBAS*/ || msg.guild == this.client.guilds.cache.get('502208815937224715') /*..*/) {
			if (msg.author.id == '270904126974590976' /*Dank Memer*/ && msg.content.includes('- Scramble -')) {
				
				let scrambledStr = msg.content.match(/`(.*?)`/g)[0].split('`').join('');
				let unscrambled = unscramble(scrambledStr);
				
				if (unscrambled[0] != 'No results found.') {
					unscrambled.forEach(w => {
						w = `\`${w}\``;
					});
					
					msg.lineReplyNoMention(`Psssst.. The word${unscrambled.length > 1 ? `s are` : ` is`} ${unscrambled.join(" ")}`);
				}
			}
		}
	//#endregion

	}
}

module.exports = MessageListener;
