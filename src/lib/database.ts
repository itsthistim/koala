import { Pool } from 'pg';
import { URL } from 'url';

if (!process.env.PG_URL) {
	console.warn('PG_URL is not defined in .env. Database features may not work.');
} else {
	try {
		const url = new URL(process.env.PG_URL);
		console.info(`[Database] Connection string protocol: '${url.protocol}'`);
	} catch (error) {
		console.error('[Database] Failed to parse PG_URL. Is it a valid URL?');
	}
}

export const db = new Pool({
	connectionString: process.env.PG_URL
});
