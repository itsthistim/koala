import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export interface Reminder {
	id: number;
	user_id: string;
	guild_id: string | null;
	channel_id: string | null;
	message_id: string | null;
	reminderText: string;
	timestamp: number;
	createdAt: number;
}

export class ReminderDatabase {
	private db: Database.Database;

	constructor(dbPath?: string) {
		const path = dbPath ?? join(process.cwd(), 'data', 'reminders.db');
		const dir = dirname(path);

		// check if data directory exists
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		this.db = new Database(path);
		this.initialize();
	}

	/**
	 * Initializes the reminders table and indexes in the database.
	 *
	 * Creates the `reminders` table with columns for storing reminder data.
	 * Also creates indexes for optimized queries.
	 */
	private initialize() {
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS reminders (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT NOT NULL,
				guild_id TEXT,
				channel_id TEXT,
				message_id TEXT,
				reminderText TEXT NOT NULL,
				timestamp INTEGER NOT NULL,
				createdAt INTEGER NOT NULL
			);
			CREATE INDEX IF NOT EXISTS idx_user_id ON reminders(user_id);
			CREATE INDEX IF NOT EXISTS idx_timestamp ON reminders(timestamp);
		`);
	}

	/**
	 * Adds a new reminder to the database.
	 * @param userId The ID of the user to remind
	 * @param reminderText The text of the reminder
	 * @param timestamp The time at which the reminder should trigger
	 * @param guildId The ID of the guild associated with the reminder (optional)
	 * @param channelId The ID of the channel associated with the reminder (optional)
	 * @param messageId The ID of the message associated with the reminder (optional)
	 * @returns {Reminder} The newly created reminder object.
	 */
	public addReminder(userId: string, reminderText: string, timestamp: number, guildId?: string, channelId?: string, messageId?: string): Reminder {
		const createdAt = Date.now();

		const stmt = this.db.prepare(`
			INSERT INTO reminders (user_id, guild_id, channel_id, message_id, reminderText, timestamp, createdAt)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const result = stmt.run(userId, guildId ?? null, channelId ?? null, messageId ?? null, reminderText, timestamp, createdAt);

		const reminder: Reminder = {
			id: result.lastInsertRowid as number,
			user_id: userId,
			guild_id: guildId ?? null,
			channel_id: channelId ?? null,
			message_id: messageId ?? null,
			reminderText,
			timestamp,
			createdAt
		};

		return reminder;
	}

	/**
	 * Retrieves all reminders that are due for processing.
	 *
	 * Returns all reminders whose timestamp has passed or is equal to the current time,
	 * ordered by timestamp in ascending order (oldest first).
	 *
	 * @returns {Reminder[]} An array of due reminders sorted by timestamp.
	 */
	public getDueReminders(): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE timestamp <= ?
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(Date.now());
		return rows as Reminder[];
	}

	/**
	 * Retrieves reminders for a specific user.
	 * @param user_id - The unique identifier of the user

	 * @returns An array of Reminder objects sorted by timestamp in ascending order
	 */
	public getUserReminders(user_id: string): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE user_id = ?
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(user_id);
		return rows as Reminder[];
	}

	/**
	 * Deletes a reminder by its global ID, but only if it belongs to the specified user.
	 * @param reminder_id - The global ID of the reminder to delete.
	 * @param user_id - The ID of the user who owns the reminder.
	 * @returns `true` if the reminder was successfully deleted, `false` otherwise.
	 */
	public deleteReminder(reminder_id: number, user_id: string): boolean {
		const stmt = this.db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?');
		const result = stmt.run(reminder_id, user_id);
		return result.changes > 0;
	}

	/**
	 * Reinitializes the reminders table by dropping the existing table and creating a new one.
	 * This will remove all existing reminder records.
	 *
	 * @returns {boolean} Always returns true if the operation completes successfully.
	 */
	public reinitialize(): boolean {
		this.db.exec('DROP TABLE IF EXISTS reminders;');
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS reminders (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT NOT NULL,
				guild_id TEXT,
				channel_id TEXT,
				message_id TEXT,
				reminderText TEXT NOT NULL,
				timestamp INTEGER NOT NULL,
				createdAt INTEGER NOT NULL
			);
		`);
		this.db.exec('CREATE INDEX IF NOT EXISTS idx_user_id ON reminders(user_id);');
		this.db.exec('CREATE INDEX IF NOT EXISTS idx_timestamp ON reminders(timestamp);');
		return true;
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

let reminderDb: ReminderDatabase | null = null;

/**
 * Retrieves the singleton instance of the reminder database.
 * Initializes the database on first call if it hasn't been created yet.
 * The database connection is intended to persist for the application's lifetime.
 * @returns {ReminderDatabase} The reminder database instance.
 */
export function getReminderDatabase(): ReminderDatabase {
	if (!reminderDb) {
		reminderDb = new ReminderDatabase();
	}
	return reminderDb;
}
