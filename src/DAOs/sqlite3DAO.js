const sqlite = require("better-sqlite3");
const dbName = process.env.DB_NAME;

class Sqlite3DAO {
    static db = sqlite(`${dbName}.db`, { fileMustExist: true });

    constructor() {
        Sqlite3DAO.db.pragma('journal_mode = WAL');
    }

    getConnection() {
        return Sqlite3DAO.db;
    }

    async createBackup() {
        const dateString = new Date().toISOString().replace(":", "-").replace(":", "-");
        const bkpName = `${dbName}_${dateString}`;
        await Sqlite3DAO.db.backup(`bkp/${bkpName}.bkp.db`);

        return bkpName;
    }

    applyTableBackup(bkpName, tableName, whereClause = "") {
        if (!tableName) {
            throw new Error("Database table must be informed when applying backup.");
        }

        const attachBkpDbQuery = `ATTACH DATABASE 'bkp/${bkpName}.bkp.db' AS BKP;`;
        const insertDataQuery = `INSERT OR IGNORE INTO ${tableName} SELECT * FROM BKP.${tableName} ${whereClause};`;
        const detachBkpDbQuery = "DETACH DATABASE BKP;";
        Sqlite3DAO.db.exec(attachBkpDbQuery + insertDataQuery + detachBkpDbQuery);
    }
}

process.on("exit", () => Sqlite3DAO.db.close());

module.exports = Sqlite3DAO;
