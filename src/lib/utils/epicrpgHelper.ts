import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

function shouldRun(msg: Message) {
	const allowedGuilds = ['1430805361094426666', '502208815937224715'];
	const allowedAuthors = ['555955826880413696', '319183644331606016'];

	if (msg.guild && !allowedGuilds.includes(msg.guild.id)) return false;
	if (!allowedAuthors.includes(msg.author.id)) return false;

	return true;
}

function rankToValue(rank: string): number {
	rank = rank.toUpperCase();

	if (rank === 'A') return 11;
	if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;

	const n = Number(rank);
	if (!Number.isNaN(n)) return Math.min(Math.max(n, 2), 11);

	return 0;
}

function getHand(line: string | null): string[] {
	const hand = line!.match(/(\d+|[jqka])([♠♣♥♦]?|(<a:)?<?:([^:]+)(:\d+)?:)/gim);
	const cardValues = hand!.map((card) => {
		const rankMatch = new RegExp(/(\d+|j|q|k|a)/i).exec(card);
		return rankMatch ? rankMatch[1].toUpperCase() : '';
	});
	return cardValues;
}

function getHandValue(hand: string[]): { total: number; isSoft: boolean } {
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
}

function suggestSoft(total: number, dealerCard: number): 'HIT' | 'STAND' {
	if (total >= 19) return 'STAND';
	if (total === 18) return dealerCard >= 9 || dealerCard === 11 ? 'HIT' : 'STAND';
	return 'HIT';
}

function suggest(total: number, soft: boolean, dealerCard: number): 'HIT' | 'STAND' {
	if (soft) return suggestSoft(total, dealerCard);
	if (total >= 17) return 'STAND';
	if (total >= 13 && total <= 16) return dealerCard >= 2 && dealerCard <= 6 ? 'STAND' : 'HIT';
	if (total === 12) return dealerCard >= 4 && dealerCard <= 6 ? 'STAND' : 'HIT';
	return 'HIT';
}

const suggestionMessages = new Map<string, Message>();

export async function blackjackHelper(msg: Message): Promise<void> {
	if (!shouldRun(msg)) {
		return;
	}

	if (!msg.embeds.length || !msg.embeds[0].fields.length) {
		return;
	}

	const field = msg.embeds[0].fields[0];
	const fieldTitle = field.name.toLowerCase();
	const fieldContent = field.value.toLowerCase();

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
	const dealerLine = dealerIndex === -1 ? null : lines[dealerIndex];

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
		`**${move}** (${isSoft ? 'soft ' : ''}${playerTotal} vs ${dealerShowingCard === 'A' ? 'A' : dealerShowingCardValue})`
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

async function countEmojiChallenge(msg: Message): Promise<void> {
	const emojiResult = /How many\s+<:([^:]+):\d+>/i.exec(msg.content);
	const emojiName = emojiResult?.[1];
	if (!emojiName) return;
	const emojiCount = (new RegExp(String.raw`<:${emojiName}:\d+>`, 'g').exec(msg.content) || []).length - 1;
	await reply(msg, `**${emojiCount}**`);
}

async function letterChallenge(msg: Message): Promise<void> {
	const emojiResult = /letter of\s+<:([^:]+):\d+>/i.exec(msg.content);
	const emojiName = emojiResult?.[1]?.toLowerCase().replaceAll(/[^a-z]/g, '') ?? null;
	if (!emojiName) return;

	const indexResult = /What's the \*\*(.+?)\*\*/i.exec(msg.content);
	const indexWord = indexResult?.[1].toLowerCase() ?? null;
	const index = indexWord ? indexes[indexWord] : null;

	if (index && index >= 1 && index <= emojiName.length) {
		await reply(msg, `**${emojiName.charAt(index - 1).toUpperCase()}**`);
	}
}

async function emojiNameChallenge(msg: Message): Promise<void> {
	const emojiResult = /(<a:)?<?:([^:]+)(:\d+)?:/i.exec(msg.content);
	const emojiName = emojiResult?.[2]?.toLowerCase().replaceAll(/[^a-z]/g, '') ?? null;
	if (!emojiName) return;

	const options: Record<string, string> = {};
	const o1 = /\*\*1\*\*\s*-\s*(.+)/i.exec(msg.content);
	const o2 = /\*\*2\*\*\s*-\s*(.+)/i.exec(msg.content);
	const o3 = /\*\*3\*\*\s*-\s*(.+)/i.exec(msg.content);
	if (o1) options['1'] = o1[1].toLowerCase().replaceAll(/[^a-z]/g, '');
	if (o2) options['2'] = o2[1].toLowerCase().replaceAll(/[^a-z]/g, '');
	if (o3) options['3'] = o3[1].toLowerCase().replaceAll(/[^a-z]/g, '');

	for (const [key, value] of Object.entries(options)) {
		if (value === emojiName) {
			await reply(msg, `**${key}**`);
			break;
		}
	}
}

async function isEmojiChallenge(msg: Message): Promise<void> {
	const emoji = /(<a:)?<?:([^:]+)(:\d+)?:/i.exec(msg.content);
	const emojiName = emoji?.[2] ?? null;

	const lines = msg.content.split('\n').map((l) => l.trim());
	const lookingFor = /(?<=\*\*).+(?=\*\*)/i.exec(lines[1])?.[0] ?? null;

	if (emojiName && lookingFor) {
		const answer = emojiName.toLowerCase() === lookingFor.toLowerCase() ? 'yes' : 'no';
		await reply(msg, `**${answer}**`);
	}
}

export async function trainingHelper(msg: Message): Promise<void> {
	if (!shouldRun(msg) || !msg.content.toLowerCase().includes('is training')) return;

	if (msg.content.includes('How many')) {
		await countEmojiChallenge(msg);
		return;
	}
	if (msg.content.includes('letter of')) {
		await letterChallenge(msg);
		return;
	}
	if (msg.content.includes('What is the name of')) await emojiNameChallenge(msg);
	if (msg.content.toLowerCase().includes('is this a')) await isEmojiChallenge(msg);
}
