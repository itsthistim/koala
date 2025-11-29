import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

function shouldRun(msg: Message) {
	const allowedGuilds = ['1430805361094426666', '502208815937224715'];
	const allowedAuthors = ['555955826880413696', '319183644331606016'];

	if (msg.guild && !allowedGuilds.includes(msg.guild.id)) return false;
	if (!allowedAuthors.includes(msg.author.id)) return false;

	return true;
}

const rankToValue = (rank: string): number => {
	rank = rank.toUpperCase();

	if (rank === 'A') return 11;
	if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;

	const n = Number(rank);
	if (!Number.isNaN(n)) return Math.min(Math.max(n, 2), 11);

	return 0;
};

const getHand = (line: string | null): string[] => {
	const cardSection = (line ?? '').split('~-~')[1] ?? '';
	const cards = cardSection.split('|').map((s) => s.trim());

	// extract card ranks, ignore face down cards ('??')
	return cards.map((token) => token.split(':')[0]).filter((card) => card && card !== '??');
};

const getHandValue = (hand: string[]) => {
	let total = 0;
	let aces = 0;

	for (const card of hand) {
		const value = rankToValue(card);
		total += value;
		if (value === 11) aces++;
	}

	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}

	const isSoft = aces > 0;

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

const suggestionMessages = new Map<string, Message>();

export async function blackjackHelper(msg: Message): Promise<void> {
	if (!shouldRun(msg)) {
		return;
	}

	if (!msg.embeds.length || !msg.embeds[0].fields.length) {
		return;
	}

	const field = msg.embeds[0].fields[0];
	const fieldContent = field.value.toLowerCase();
	const fieldTitle = field.name.toLowerCase();

	// check if it's a blackjack game message
	if (!fieldContent.includes('epic dealer') || !fieldContent.includes('total:')) {
		return;
	}

	// react with skull if dealer gets blackjack
	if (fieldContent.includes("**epic dealer**'s total: 21")) {
		msg.react('💀').catch(() => {});
	}

	// react with middle finger if player gets blackjack and wins
	if (fieldTitle.includes('you won') && fieldContent.includes('total: 21')) {
		msg.react('🖕').catch(() => {});
	}

	// remove suggestion if game is over
	if (fieldTitle.includes('you lost') || fieldTitle.includes('you won') || fieldTitle.includes("1/1! it's a tie lmao")) {
		const suggestionMessage = suggestionMessages.get(msg.id);
		if (suggestionMessage) {
			await suggestionMessage.delete().catch(() => {});
			suggestionMessages.delete(msg.id);
		}

		return;
	}

	const lines = fieldContent.split('\n').map((l) => l.trim());
	if (lines.length < 2) {
		return;
	}

	// extract player's hand and dealer upcard
	const playerLine = lines[0];
	const dealerIndex = lines.findIndex((l) => l.includes('epic dealer'));
	const dealerLine = dealerIndex !== -1 ? lines[dealerIndex] : null;

	if (!playerLine || dealerIndex === -1) {
		return;
	}

	const playerHand = getHand(playerLine);
	const { total: playerTotal, isSoft } = getHandValue(playerHand);

	const dealerHand = getHand(dealerLine);
	const dealerShowingCard = dealerHand[0];
	if (!dealerShowingCard) {
		return;
	}

	const dealerShowingCardValue = rankToValue(dealerShowingCard);

	const move = suggest(playerTotal, isSoft, dealerShowingCardValue);
	const suggestionMsg = await reply(
		msg,
		`**${move.toUpperCase()}** (${isSoft ? 'soft ' : ''}${playerTotal} vs ${dealerShowingCard === 'A' ? 'A' : dealerShowingCardValue})`
	);

	// cache the suggestion message
	suggestionMessages.set(msg.id, suggestionMsg);
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
	if (!shouldRun(msg)) return;

	// count emoji challenge
	if (msg.content.includes('is training') && msg.content.includes('How many')) {
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
