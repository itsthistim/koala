import { Pool } from 'pg';
import { URL } from 'node:url';

if (process.env.PG_URL) {
	try {
		const url = new URL(process.env.PG_URL);
		console.info(`[Database] Connection string protocol: '${url.protocol}'`);
	} catch (error) {
		console.error('[Database] Failed to parse PG_URL. Is it a valid URL?');
	}
} else {
	console.warn('PG_URL is not defined in .env. Database features may not work.');
}

export const db = new Pool({
	connectionString: process.env.PG_URL
});
