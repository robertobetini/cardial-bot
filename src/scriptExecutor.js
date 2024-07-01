const fs = require("fs");

const dbName = process.env.DB_NAME;
const db = require("better-sqlite3")(`${dbName}.db`);

const Logger = require("./logger");

module.exports = {
    execute: (path) => {
        let script = "";
        try {
            script = fs.readFileSync(path, { encoding: "utf-8" });
        } catch {
            Logger.error(`Error loading script '${path}'`);
            return;
        }

        Logger.info(`Executing script '${path}'`);
        try {
            db.prepare(script).run();
        } catch(err) {
            Logger.error(err);
        }

        db.close();
        Logger.info(`Finished script '${path}'`);
    }
};
