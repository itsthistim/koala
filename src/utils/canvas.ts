import { createCanvas } from 'canvas';
import type { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { AttachmentBuilder } from 'discord.js';

export async function createAttachment(
	width: number,
	height: number,
	filename: string,
	drawFn: (ctx: CanvasRenderingContext2D, canvas: Canvas) => Promise<void> | void
): Promise<AttachmentBuilder> {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	await drawFn(ctx, canvas);

	const buffer = canvas.toBuffer();
	if (Buffer.byteLength(buffer) > 8e6) {
		throw new Error('Generated image exceeds 8MB size limit');
	}

	return new AttachmentBuilder(buffer, { name: filename });
}

export function shortenText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	let shorten = false;
	while (ctx.measureText(`${text}...`).width > maxWidth) {
		if (!shorten) shorten = true;
		text = text.substring(0, text.length - 1);
	}
	return shorten ? `${text}...` : text;
}

/**
 * Fits the given text within the specified width and height constraints by adding newlines as needed.
 * If the text exceeds the maximum height, it will be truncated and an ellipsis will be added.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context used to measure text.
 * @param {string} text - The text to fit within the constraints.
 * @param {number} maxWidth - The maximum width (in pixels) for each line.
 * @param {number} maxHeight - The maximum height (in pixels) for the entire text block.
 * @returns {string} The fitted text with newlines and possible truncation.
 */
export function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number): string {
	const words = text.split(' ');
	let fittedText = '';
	let line = '';

	for (let n = 0; n < words.length; n++) {
		const testLine = line + words[n] + ' ';
		const metrics = ctx.measureText(testLine);
		const testWidth = metrics.width;

		// Check if maxHeight is exceeded
		const lineHeight = parseInt(ctx.font.match(/(\d+)px/)?.[1] || '16', 10);
		const currentHeight = (fittedText.split('\n').length + 1) * lineHeight;
		if (currentHeight > maxHeight) {
			return shortenText(ctx, fittedText.trim(), maxWidth);
		}

		if (testWidth > maxWidth && n > 0) {
			fittedText += line + '\n';
			line = words[n] + ' ';
		} else {
			line = testLine;
		}
	}
	fittedText += line;
	return fittedText;
}

export function greyscale(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < data.data.length; i += 4) {
		const brightness = 0.34 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
		data.data[i] = brightness;
		data.data[i + 1] = brightness;
		data.data[i + 2] = brightness;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function invert(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = 255 - data.data[i];
		data.data[i + 1] = 255 - data.data[i + 1];
		data.data[i + 2] = 255 - data.data[i + 2];
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function silhouette(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = 0;
		data.data[i + 1] = 0;
		data.data[i + 2] = 0;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function sepia(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < data.data.length; i += 4) {
		const brightness = 0.34 * data.data[i] + 0.5 * data.data[i + 1] + 0.16 * data.data[i + 2];
		data.data[i] = brightness + 100;
		data.data[i + 1] = brightness + 50;
		data.data[i + 2] = brightness;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function contrast(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	const factor = 259 / 100 + 1;
	const intercept = 128 * (1 - factor);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = data.data[i] * factor + intercept;
		data.data[i + 1] = data.data[i + 1] * factor + intercept;
		data.data[i + 2] = data.data[i + 2] * factor + intercept;
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function desaturate(
	ctx: CanvasRenderingContext2D,
	level: number,
	x: number,
	y: number,
	width: number,
	height: number
): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const dest = (i * width + j) * 4;
			const grey = Number.parseInt(String(0.2125 * data.data[dest] + 0.7154 * data.data[dest + 1] + 0.0721 * data.data[dest + 2]), 10);
			data.data[dest] += level * (grey - data.data[dest]);
			data.data[dest + 1] += level * (grey - data.data[dest + 1]);
			data.data[dest + 2] += level * (grey - data.data[dest + 2]);
		}
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function distort(
	ctx: CanvasRenderingContext2D,
	amplitude: number,
	x: number,
	y: number,
	width: number,
	height: number,
	strideLevel: number = 4
): CanvasRenderingContext2D {
	const data = ctx.getImageData(x, y, width, height);
	const temp = ctx.getImageData(x, y, width, height);
	const stride = width * strideLevel;
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const xs = Math.round(amplitude * Math.sin(2 * Math.PI * 3 * (j / height)));
			const ys = Math.round(amplitude * Math.cos(2 * Math.PI * 3 * (i / width)));
			const dest = j * stride + i * strideLevel;
			const src = (j + ys) * stride + (i + xs) * strideLevel;
			data.data[dest] = temp.data[src];
			data.data[dest + 1] = temp.data[src + 1];
			data.data[dest + 2] = temp.data[src + 2];
		}
	}
	ctx.putImageData(data, x, y);
	return ctx;
}

export function fishEye(ctx: CanvasRenderingContext2D, level: number, x: number, y: number, width: number, height: number): CanvasRenderingContext2D {
	const frame = ctx.getImageData(x, y, width, height);
	const source = new Uint8Array(frame.data);
	for (let i = 0; i < frame.data.length; i += 4) {
		const sx = (i / 4) % frame.width;
		const sy = Math.floor(i / 4 / frame.width);
		const dx = Math.floor(frame.width / 2) - sx;
		const dy = Math.floor(frame.height / 2) - sy;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const x2 = Math.round(frame.width / 2 - dx * Math.sin(dist / (level * Math.PI) / 2));
		const y2 = Math.round(frame.height / 2 - dy * Math.sin(dist / (level * Math.PI) / 2));
		const i2 = (y2 * frame.width + x2) * 4;
		frame.data[i] = source[i2];
		frame.data[i + 1] = source[i2 + 1];
		frame.data[i + 2] = source[i2 + 2];
		frame.data[i + 3] = source[i2 + 3];
	}
	ctx.putImageData(frame, x, y);
	return ctx;
}

export function pixelize(
	ctx: CanvasRenderingContext2D,
	canvas: Canvas,
	image: Image,
	level: number,
	x: number,
	y: number,
	width: number,
	height: number
): CanvasRenderingContext2D {
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(image, x, y, width * level, height * level);
	ctx.drawImage(canvas, x, y, width * level, height * level, x, y, width, height);
	ctx.imageSmoothingEnabled = true;
	return ctx;
}

export function hasAlpha(image: Image): boolean {
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let hasAlphaPixels = false;
	for (let i = 3; i < data.data.length; i += 4) {
		if (data.data[i] < 255) {
			hasAlphaPixels = true;
			break;
		}
	}
	return hasAlphaPixels;
}

export function drawImageWithTint(
	ctx: CanvasRenderingContext2D,
	image: Image,
	color: string,
	x: number,
	y: number,
	width: number,
	height: number
): void {
	const { fillStyle, globalAlpha } = ctx;
	ctx.fillStyle = color;
	ctx.drawImage(image, x, y, width, height);
	ctx.globalAlpha = 0.5;
	ctx.fillRect(x, y, width, height);
	ctx.fillStyle = fillStyle;
	ctx.globalAlpha = globalAlpha;
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): Promise<string[] | null> {
	return new Promise((resolve) => {
		if (ctx.measureText(text).width < maxWidth) return resolve([text]);
		if (ctx.measureText('W').width > maxWidth) return resolve(null);
		const words = text.split(' ');
		const lines: string[] = [];
		let line = '';
		while (words.length > 0) {
			let split = false;
			while (ctx.measureText(words[0]).width >= maxWidth) {
				const temp = words[0];
				words[0] = temp.slice(0, -1);
				if (split) {
					words[1] = `${temp.slice(-1)}${words[1]}`;
				} else {
					split = true;
					words.splice(1, 0, temp.slice(-1));
				}
			}
			if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
				line += `${words.shift()} `;
			} else {
				lines.push(line.trim());
				line = '';
			}
			if (words.length === 0) lines.push(line.trim());
		}
		return resolve(lines);
	});
}

export function centerImage(base: Image, data: Image): { x: number; y: number; width: number; height: number } {
	const dataRatio = data.width / data.height;
	const baseRatio = base.width / base.height;
	let { width, height } = data;
	let x = 0;
	let y = 0;
	if (baseRatio < dataRatio) {
		height = data.height;
		width = base.width * (height / base.height);
		x = (data.width - width) / 2;
		y = 0;
	} else if (baseRatio > dataRatio) {
		width = data.width;
		height = base.height * (width / base.width);
		x = 0;
		y = (data.height - height) / 2;
	}
	return { x, y, width, height };
}

export function centerImagePart(
	data: Image,
	maxWidth: number,
	maxHeight: number,
	widthOffset: number,
	heightOffest: number
): { x: number; y: number; width: number; height: number } {
	let { width, height } = data;
	if (width > maxWidth) {
		const ratio = maxWidth / width;
		width = maxWidth;
		height *= ratio;
	}
	if (height > maxHeight) {
		const ratio = maxHeight / height;
		height = maxHeight;
		width *= ratio;
	}
	const x = widthOffset + (maxWidth / 2 - width / 2);
	const y = heightOffest + (maxHeight / 2 - height / 2);
	return { x, y, width, height };
}

export function generateErrorImage(error: string): { attachment: Buffer; name: string } {
	const canvas = createCanvas(512, 512);
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#20C20E';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	ctx.font = '20px Consolas';
	ctx.fillText('Error', 64, 64);
	ctx.font = '16px Consolas';
	ctx.fillText(error, 64, 80);
	return {
		attachment: canvas.toBuffer(),
		name: 'error.png'
	};
}
