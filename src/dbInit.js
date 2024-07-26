const fs = require("fs");

const SQL_SCRIPTS_DIR = "db_scripts/init";

const dbName = process.env.DB_NAME;
const db = require("better-sqlite3")(`${dbName}.db`);
db.pragma('journal_mode = WAL');

const Logger = require("./logger");

module.exports = {
    init: () => {
        Logger.info(`Initializing sqlite3 database ${dbName}`);
        
        if (!fs.existsSync("bkp")) {
            fs.mkdirSync("bkp");
        }

        const fileNames = fs.readdirSync(SQL_SCRIPTS_DIR);
        for (let fileName of fileNames) {
            try {
                const tableCreationSql = fs.readFileSync(`${SQL_SCRIPTS_DIR}/${fileName}`, { encoding: "utf-8" });
                db.prepare(tableCreationSql).run();
            } catch(err) {
                Logger.error(`Error executing script '${fileName}'`);
                throw err;
            }
        }
        db.close();

        Logger.info(`Successfully initialized ${dbName}`);
    }
}