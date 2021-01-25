const mysql = require("mysql2/promise")
module.exports = {
    //Query
    query: async function (mysqlQuery, data) {

        try {

            const [rows, fields] = await dbConnection.query(mysqlQuery, data);
            return [rows, fields]

        } catch (e) {
            //Overwrite old connection with new one
            dbConnection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PW,
                database: process.env.DB_NAME,
                enableKeepAlive: true
            })

            //Exec the mysql query and return data
            const [rows, fields] = await dbConnection.query(mysqlQuery, data);
            return [rows, fields]
        }
    },

    //Execute
    execute: async function (mysqlQuery, data) {
        try {
            const [rows, fields] = await dbConnection.execute(mysqlQuery, data);
            return [rows, fields]
        } catch (e) {
            //Overwrite old connection with new one
            dbConnection = await mysql.createConnection({
                host: host,
                user: user,
                password: pass,
                database: d,
            })

            //Exec the mysql query and return data
            const [rows, fields] = await dbConnection.execute(mysqlQuery, data);
            return [rows, fields]
        }
    }
}