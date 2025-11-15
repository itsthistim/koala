import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const loadingMessages = ['Computing...', 'Thinking...', 'Cooking...', 'Give me a moment...', 'Loading...'];

export const colors = {
	default: 0x9bacb4,
	green: 0x57f287,
	red: 0xed4245,
	blue: 0x3498db,
	yellow: 0xe67e22
};
