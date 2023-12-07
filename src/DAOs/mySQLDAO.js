const mysql = require("mysql2/promise");

class MySQLDAO {
    connection = null;

    async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '123456',
            database : 'DISCORD_USERS_DB'
        });

        return this.connection;
    }
}

module.exports = MySQLDAO;