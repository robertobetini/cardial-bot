const Sqlite3DAO = require("./sqlite3DAO");

const Stats = require("../models/stats");

class StatsDAO extends Sqlite3DAO {
    async clearGoldFromAll(guildId) {
        const db = this.getConnection();
        const query = "UPDATE STATS SET gold = 0 WHERE guildId = ?";
        db.prepare(query).run(guildId);
    }

    async get(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM STATS WHERE userId = ? AND guildId = ?";
        const stat = db.prepare(query).run(userId, guildId);

        return Stats.fromDTO(stat);
    }

    async insert(userId, guildId, stats, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "INSERT INTO STATS (userId, guildId, totalExp, gold, currentHP, maxHP, tempHP, currentFP, maxFP, tempFP, currentSP, maxSP, tempSP, baseDEF, baseInitiative) "
         + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.prepare(query).run(
            userId, guildId, 
            stats.totalExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF, stats.baseInitiative
        );
    }

    async update(userId, guildId, stats, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "UPDATE STATS SET totalExp = ?, gold = ?," 
            + " currentHP = ?, maxHP = ?, tempHP = ?," 
            + " currentFP = ?, maxFP = ?, tempFP = ?," 
            + " currentSP = ?, maxSP = ?, tempSP = ?,"
            + " baseDEF = ?, baseInitiative = ?"
            + " WHERE userId = ? AND guildId = ?";

        const res = db.prepare(query).run( 
            stats.totalExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF, stats.baseInitiative,
            userId, guildId
        );

        return res.changes.valueOf() > 0;
    }

    async upsert(userId, guildId, stats, transactionDb = null) {
        const updated = await this.update(userId, guildId, stats, transactionDb);

        if (!updated) {
            await this.insert(userId, guildId, stats, transactionDb);
        }
    }

    async updateSingleStat(userId, guildId, stat, newValue) {
        const db = this.getConnection();
        const query = "UPDATE STATS SET " + stat +" = ? WHERE userId = ? AND guildId = ?";
        db.prepare(query).run(newValue, userId, guildId);
    }
}

module.exports = new StatsDAO();
