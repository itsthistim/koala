import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

async function shouldRun(msg: Message) {
	const allowedGuilds = ['1430805361094426666', '502208815937224715'];
	const allowedAuthors = ['555955826880413696', '319183644331606016'];

	if (msg.guild && !allowedGuilds.includes(msg.guild.id)) return false;
	if (!allowedAuthors.includes(msg.author.id)) return false;

	return true;
}

const rankToValue = (rank: string): { value: number; isAce: boolean } => {
	rank = rank.toUpperCase();

	// aces
	if (rank === 'A') {
		return { value: 11, isAce: true };
	}

	// face cards
	if (rank === 'K' || rank === 'Q' || rank === 'J') {
		return { value: 10, isAce: false };
	}

	const n = Number(rank);
	if (!Number.isNaN(n)) {
		return { value: Math.min(Math.max(n, 2), 11), isAce: false };
	}
	return { value: 0, isAce: false };
};

const parseCardRanksFromLine = (line: string): string[] => {
	const afterMarker = line.split('~-~')[1] ?? '';
	return afterMarker
		.split('|')
		.map((s) => s.trim())
		.filter((s) => s && s !== '??')
		.map((token) => token.split(':')[0]);
};

const computeHand = (ranks: string[]) => {
	let total = 0;
	let aces = 0;
	for (const r of ranks) {
		const { value, isAce } = rankToValue(r);
		total += value;
		if (isAce) aces++;
	}
	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	const isSoft = aces > 0; // at least one Ace counted as 11
	return { total, isSoft };
};

const suggest = (total: number, soft: boolean, dealerCard: number): 'hit' | 'stand' => {
	// Soft totals (hands with an Ace counted as 11)
	if (soft) {
		if (total >= 19) return 'stand'; // A,8 or A,9 - always stand
		if (total === 18) {
			// A,7 - stand vs 2-8, hit vs 9,10,A
			return dealerCard >= 9 || dealerCard === 11 ? 'hit' : 'stand';
		}
		// A,2 through A,6 - always hit
		return 'hit';
	}

	// Hard totals
	if (total >= 17) return 'stand'; // 17+ always stand
	if (total >= 13 && total <= 16) {
		// 13-16: stand vs dealer 2-6, hit vs 7-A
		return dealerCard >= 2 && dealerCard <= 6 ? 'stand' : 'hit';
	}
	if (total === 12) {
		// 12: stand vs dealer 4-6, hit otherwise
		return dealerCard >= 4 && dealerCard <= 6 ? 'stand' : 'hit';
	}
	// 11 or less: always hit
	return 'hit';
};

const suggestionCache = new Map<string, Message>();

export async function blackjackHelper(msg: Message): Promise<void> {
	if (!(await shouldRun(msg))) return;

	if (!msg.embeds.length || !msg.embeds[0].fields.length) return;

	const field = msg.embeds[0].fields[0];
	const fieldValue = field.value;
	const fieldName = field.name;

	if (fieldValue.toLowerCase().includes("**epic dealer**'s total: 21")) {
		msg.react('💀').catch(() => {});
	}

	const lower = fieldValue.toLowerCase();
	if (!lower.includes('epic dealer') || !lower.includes('total:')) return;

	// check if game is over
	const nameLower = fieldName.toLowerCase();
	if (nameLower.includes('you lost') || nameLower.includes('you won') || nameLower.includes("1/1! it's a tie lmao")) {
		// delete the suggestion message if it exists
		const cachedSuggestion = suggestionCache.get(msg.id);
		if (cachedSuggestion) {
			await cachedSuggestion.delete().catch(() => {});
			suggestionCache.delete(msg.id);
		}
		return;
	}

	const lines = fieldValue.split('\n').map((l) => l.trim());
	if (lines.length < 2) return;

	// extract player's hand and dealer upcard
	const playerLine = lines[0];
	const dealerLineIndex = lines.findIndex((l) => l.toLowerCase().includes('epic dealer'));
	if (dealerLineIndex === -1) return;
	const dealerLine = lines[dealerLineIndex];

	const playerRanks = parseCardRanksFromLine(playerLine);
	const { total: playerTotal, isSoft } = computeHand(playerRanks);

	const dealerRanks = parseCardRanksFromLine(dealerLine);
	const dealerUpRank = dealerRanks[0];
	if (!dealerUpRank) return;
	const { value: dealerUpValue, isAce: dealerIsAce } = rankToValue(dealerUpRank);
	const dealerUp = dealerIsAce ? 11 : dealerUpValue >= 10 ? 10 : dealerUpValue;

	const move = suggest(playerTotal, isSoft, dealerUp);
	const suggestionMsg = await reply(
		msg,
		`Blackjack helper: ${move.toUpperCase()} (you: ${playerTotal}${isSoft ? ' soft' : ''}, dealer: ${dealerUp === 11 ? 'A' : dealerUp})`
	);

	// cache the suggestion message
	suggestionCache.set(msg.id, suggestionMsg);
}

const indexes = {
	first: 1,
	second: 2,
	third: 3,
	fourth: 4,
	fifth: 5,
	sixth: 6,
	seventh: 7,
	eighth: 8,
	ninth: 9,
	tenth: 10
} as { [key: string]: number };

export async function trainingHelper(msg: Message): Promise<void> {
	if (!(await shouldRun(msg))) return;

	// count emoji challenge
	if (msg.content.includes('How many')) {
		let emojiResult = msg.content.match(/How many\s+<:([^:]+):\d+>/i);
		let emojiName = emojiResult ? emojiResult[1] : null;

		if (emojiName) {
			const emojiCount = (msg.content.match(new RegExp(`<:${emojiName}:\\d+>`, 'g')) || []).length - 1;
			await reply(msg, `**${emojiCount}**`);
		}

		return;
	}

	// letter challenge
	if (msg.content.includes('is training') && msg.content.includes('letter of')) {
		let emojiResult = msg.content.match(/letter of\s+<:([^:]+):\d+>/i);
		let emojiName = emojiResult ? emojiResult[1] : null;

		if (emojiName) {
			emojiName = emojiName?.toLowerCase().replace(/[^a-z]/g, '');

			let indexResult = msg.content.match(/What's the \*\*(.+?)\*\*/i);
			let indexWord = indexResult ? indexResult[1].toLowerCase() : null;
			let index = indexWord ? indexes[indexWord] : null;

			if (index && index >= 1 && index <= emojiName.length) {
				const letter = emojiName.charAt(index - 1).toUpperCase();
				await reply(msg, `**${letter}**`);
			}
		}

		return;
	}
}
