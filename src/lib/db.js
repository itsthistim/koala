import { Sequelize } from "sequelize";

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	host: process.env.DB_HOST,
	dialect: "sqlite",
	storage: "db.sqlite",
	logging: false
});

export default db;

export const tables = {
	FollowedUsers: db.define("followed_users", {
		user_id: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		guild_id: {
			type: Sequelize.STRING,
			allowNull: true
		}
	}),
	FollowedGuilds: db.define("followed_guilds", {
		guild_id: {
			type: Sequelize.STRING,
			primaryKey: true
		}
	})
};
