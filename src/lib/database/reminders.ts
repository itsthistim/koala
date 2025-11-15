import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export interface Reminder {
	id: number;
	userId: string;
	channelId: string | null;
	guildId: string | null;
	messageId: string | null;
	message: string;
	timestamp: number;
	completed: boolean;
	createdAt: number;
}

export class ReminderDatabase {
	private db: Database.Database;

	constructor(dbPath?: string) {
		const path = dbPath ?? join(process.cwd(), 'data', 'reminders.db');
		const dir = dirname(path);
		
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		
		this.db = new Database(path);
		this.initialize();
	}

	private initialize() {
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS reminders (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				userId TEXT NOT NULL,
				channelId TEXT,
				guildId TEXT,
				messageId TEXT,
				message TEXT NOT NULL,
				timestamp INTEGER NOT NULL,
				completed INTEGER DEFAULT 0,
				createdAt INTEGER NOT NULL
			);
			CREATE INDEX IF NOT EXISTS idx_timestamp ON reminders(timestamp);
			CREATE INDEX IF NOT EXISTS idx_completed ON reminders(completed);
		`);
	}

	public addReminder(userId: string, message: string, timestamp: number, channelId?: string, guildId?: string, messageId?: string): Reminder {
		const createdAt = Date.now();
		const stmt = this.db.prepare(`
			INSERT INTO reminders (userId, channelId, guildId, messageId, message, timestamp, createdAt)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const result = stmt.run(userId, channelId ?? null, guildId ?? null, messageId ?? null, message, timestamp, createdAt);

		return {
			id: result.lastInsertRowid as number,
			userId,
			channelId: channelId ?? null,
			guildId: guildId ?? null,
			messageId: messageId ?? null,
			message,
			timestamp,
			completed: false,
			createdAt
		};
	}

	public getDueReminders(): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE completed = 0 AND timestamp <= ?
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(Date.now()) as Array<{
			id: number;
			userId: string;
			channelId: string | null;
			guildId: string | null;
			messageId: string | null;
			message: string;
			timestamp: number;
			completed: number;
			createdAt: number;
		}>;
		return rows.map((row) => ({
			...row,
			completed: Boolean(row.completed),
			channelId: row.channelId ?? null,
			guildId: row.guildId ?? null,
			messageId: row.messageId ?? null
		}));
	}

	public markCompleted(id: number): void {
		const stmt = this.db.prepare('UPDATE reminders SET completed = 1 WHERE id = ?');
		stmt.run(id);
	}

	public getUserReminders(userId: string, includeCompleted = false): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE userId = ? ${includeCompleted ? '' : 'AND completed = 0'}
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(userId) as Array<{
			id: number;
			userId: string;
			channelId: string | null;
			guildId: string | null;
			messageId: string | null;
			message: string;
			timestamp: number;
			completed: number;
			createdAt: number;
		}>;
		return rows.map((row) => ({
			...row,
			completed: Boolean(row.completed),
			channelId: row.channelId ?? null,
			guildId: row.guildId ?? null,
			messageId: row.messageId ?? null
		}));
	}

	public deleteReminder(id: number, userId: string): boolean {
		const stmt = this.db.prepare('DELETE FROM reminders WHERE id = ? AND userId = ?');
		const result = stmt.run(id, userId);
		return result.changes > 0;
	}

	/**
	 * Closes the database connection.
	 *
	 * Note: Since ReminderDatabase is used as a singleton via getReminderDatabase(),
	 * the connection is intended to persist for the application's lifetime.
	 * Only call this method during application shutdown if you are sure no further
	 * database operations will occur.
	 */
	public close() {
		this.db.close();
	}
}

// Singleton instance of ReminderDatabase.
// The database connection is intended to persist for the application's lifetime.
// Do not call `close()` on this instance except during application shutdown.
let reminderDb: ReminderDatabase | null = null;

export function getReminderDatabase(): ReminderDatabase {
	if (!reminderDb) {
		reminderDb = new ReminderDatabase();
	}
	return reminderDb;
}
