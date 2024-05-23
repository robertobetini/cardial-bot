const mysql = require("mysql2/promise");

class MySQLDAO {
    connection = null;

    async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await mysql.createConnection({
            host     : 'us-02.bed.ovh',
            user     : 'u3962_LoIOMfrNtf',
            password : '!QR.p+TiJjr6lVoBRK0faMai',
            database : 's3962_DISCORD_USERS_DB'
        });

        return this.connection;
    }
}

module.exports = MySQLDAO;