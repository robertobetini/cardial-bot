const mysql = require("mysql2/promise");

class MySQLDAO {
    connection = null;

    async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await mysql.createConnection({
            host     : process.env.DB_HOST,
            user     : process.env.DB_USER,
            password : process.env.DB_PASSWORD,
            database : process.env.DB_NAME
        });

        return this.connection;
    }
}

module.exports = MySQLDAO;