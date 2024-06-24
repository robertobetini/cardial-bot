const fs = require("fs");

const dbName = process.env.DB_NAME;
const db = require("better-sqlite3")(`${dbName}.db`);
db.pragma('journal_mode = WAL');

const Logger = require("./logger");

module.exports = {
    init: () => {
        Logger.info(`Initializing sqlite3 database ${dbName}`);
        
        const fileNames = fs.readdirSync("db_scripts/init");
        for (let fileName of fileNames) {
            const tableCreationSql = fs.readFileSync(`db_scripts/init/${fileName}`, { encoding: "utf-8" });
            db.prepare(tableCreationSql).run();
        }
        db.close();

        Logger.info(`Successfully initialized ${dbName}`);
    }
}