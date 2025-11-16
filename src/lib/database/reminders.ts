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
	completed: boolean;
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
				completed BOOLEAN DEFAULT FALSE,
				createdAt INTEGER NOT NULL
			);
			CREATE INDEX IF NOT EXISTS idx_timestamp ON reminders(timestamp);
			CREATE INDEX IF NOT EXISTS idx_completed ON reminders(completed);
		`);
	}

	/**
	 * Adds a new reminder to the database.
	 * @param user_id The ID of the user to remind
	 * @param reminderText The text of the reminder
	 * @param timestamp The time at which the reminder should trigger
	 * @param guild_id The ID of the guild associated with the reminder (optional)
	 * @param channel_id The ID of the channel associated with the reminder (optional)
	 * @param message_id The ID of the message associated with the reminder (optional)
	 * @returns {Reminder} The newly created reminder object.
	 */
	public addReminder(
		user_id: string,
		reminderText: string,
		timestamp: number,
		guild_id?: string,
		channel_id?: string,
		message_id?: string
	): Reminder {
		const createdAt = Date.now();
		const stmt = this.db.prepare(`
			INSERT INTO reminders (user_id, guild_id, channel_id, message_id, reminderText, timestamp, createdAt)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const result = stmt.run(user_id, guild_id ?? null, channel_id ?? null, message_id ?? null, reminderText, timestamp, createdAt);

		return {
			id: result.lastInsertRowid as number,
			user_id,
			guild_id: guild_id ?? null,
			channel_id: channel_id ?? null,
			message_id: message_id ?? null,
			reminderText,
			timestamp,
			completed: false,
			createdAt
		};
	}

	/**
	 * Retrieves all reminders that are due for processing.
	 *
	 * Returns incomplete reminders whose timestamp has passed or is equal to the current time,
	 * ordered by timestamp in ascending order (oldest first).
	 *
	 * @returns {Reminder[]} An array of due reminders sorted by timestamp.
	 */
	public getDueReminders(): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE completed = 0 AND timestamp <= ?
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(Date.now());
		return rows as Reminder[];
	}

	/**
	 * Marks a reminder as completed by its ID.
	 * @param id - The unique identifier of the reminder to mark as completed.
	 */
	public markCompleted(id: number): void {
		const stmt = this.db.prepare('UPDATE reminders SET completed = TRUE WHERE id = ?');
		stmt.run(id);
	}

	/**
	 * Retrieves reminders for a specific user.
	 * @param user_id - The unique identifier of the user
	 * @param includeCompleted - Whether to include completed reminders. Defaults to false
	 * @returns An array of Reminder objects sorted by timestamp in ascending order
	 */
	public getUserReminders(user_id: string, includeCompleted = false): Reminder[] {
		const stmt = this.db.prepare(`
			SELECT * FROM reminders
			WHERE user_id = ? ${includeCompleted ? '' : 'AND completed = 0'}
			ORDER BY timestamp ASC
		`);

		const rows = stmt.all(user_id);
		return rows as Reminder[];
	}

	/**
	 * Retrieves a reminder for a specific user by reminder ID.
	 * @param id - The ID of the reminder to retrieve.
	 * @param user_id - The ID of the user who owns the reminder.
	 * @returns The reminder object if found, otherwise null.
	 */
	public getUserReminder(id: number, user_id: string): Reminder | null {
		const stmt = this.db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?');
		const row = stmt.get(id, user_id);
		return (row as Reminder) || null;
	}

	/**
	 * Deletes a reminder by its ID and user ID.
	 * @param id - The ID of the reminder to delete.
	 * @param user_id - The user ID associated with the reminder.
	 * @returns `true` if the reminder was successfully deleted, `false` otherwise.
	 */
	public deleteReminder(id: number, user_id: string): boolean {
		const stmt = this.db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?');
		const result = stmt.run(id, user_id);
		return result.changes > 0;
	}

	/**
	 * Deletes all completed reminders from the database.
	 * @returns {boolean} True if one or more reminders were deleted, false otherwise.
	 */
	public deleteCompletedReminders(): boolean {
		const stmt = this.db.prepare('DELETE FROM reminders WHERE completed = TRUE');
		const result = stmt.run();
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
				completed BOOLEAN DEFAULT FALSE,
				createdAt INTEGER NOT NULL
			);
		`);
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
