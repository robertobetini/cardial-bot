const Sqlite3DAO = require("./sqlite3DAO");

const Stats = require("../models/stats");

class StatsDAO extends Sqlite3DAO {
    clearGoldFromAll(guildId) {
        const db = this.getConnection();
        const query = "UPDATE STATS SET gold = 0 WHERE guildId = ?";
        db.prepare(query).run(guildId);
    }

    get(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM STATS WHERE userId = ? AND guildId = ?";
        const stat = db.prepare(query).get(userId, guildId);

        return Stats.fromDTO(stat);
    }

    insert(userId, guildId, stats, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "INSERT INTO STATS (userId, guildId, totalExp, totalMasteryExp, gold, currentHP, maxHP, tempHP, currentFP, maxFP, tempFP, currentSP, maxSP, tempSP, baseDEF, baseInitiative) "
         + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.prepare(query).run(
            userId, guildId, 
            stats.totalExp, stats.totalMasteryExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF, stats.baseInitiative
        );
    }

    update(userId, guildId, stats, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "UPDATE STATS SET totalExp = ?, totalMasteryExp = ?, gold = ?," 
            + " currentHP = ?, maxHP = ?, tempHP = ?," 
            + " currentFP = ?, maxFP = ?, tempFP = ?," 
            + " currentSP = ?, maxSP = ?, tempSP = ?,"
            + " baseDEF = ?, baseInitiative = ?"
            + " WHERE userId = ? AND guildId = ?";

        const res = db.prepare(query).run( 
            stats.totalExp, stats.totalMasteryExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF, stats.baseInitiative,
            userId, guildId
        );

        return res.changes.valueOf() > 0;
    }

    upsert(userId, guildId, stats, transactionDb = null) {
        const updated = this.update(userId, guildId, stats, transactionDb);

        if (!updated) {
            this.insert(userId, guildId, stats, transactionDb);
        }
    }

    updateSingleStat(userId, guildId, stat, newValue) {
        const db = this.getConnection();
        const query = "UPDATE STATS SET " + stat +" = ? WHERE userId = ? AND guildId = ?";
        db.prepare(query).run(newValue, userId, guildId);
    }
}

module.exports = new StatsDAO();
