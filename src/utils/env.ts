export function envParseArray(key: string, separator = ','): string[] {
	const value = process.env[key];
	if (!value) return [];
	return value.split(separator).map((v) => v.trim());
}
