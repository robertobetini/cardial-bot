const sqlite = require("better-sqlite3");

class Sqlite3DAO {
    static db = sqlite(`${process.env.DB_NAME}.db`, { fileMustExist: true });

    constructor() {
        Sqlite3DAO.db.pragma('journal_mode = WAL');
    }

    getConnection() {
        return Sqlite3DAO.db;
    }
}

process.on("exit", () => Sqlite3DAO.db.close());

module.exports = Sqlite3DAO;
