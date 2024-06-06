const MySQLDAO = require("./mySQLDAO");

const Stats = require("../models/stats");

class StatsDAO extends MySQLDAO {
    async clearGoldFromAll(guildId) {
        const conn = await this.getConnection();
        const query = "UPDATE STATS SET gold = 0 WHERE guildId = ?";
        const _res =  await conn.execute(query, [guildId]);
    }

    async get(userId, guildId) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM STATS WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        return Stats.fromDTO(res[0][0]);
    }

    async insert(userId, guildId, stats, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "INSERT INTO STATS (userId, guildId, totalExp, gold, currentHP, maxHP, tempHP, currentFP, maxFP, tempFP, currentSP, maxSP, tempSP, baseDEF) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        const _res = await conn.execute(query, [
            userId, guildId, 
            stats.totalExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF
        ]);
    }

    async update(userId, guildId, stats, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "UPDATE STATS SET totalExp = ?, gold = ?," 
            + " currentHP = ?, maxHP = ?, tempHP = ?," 
            + " currentFP = ?, maxFP = ?, tempFP = ?," 
            + " currentSP = ?, maxSP = ?, tempSP = ?,"
            + " baseDEF = ?"
            + " WHERE userId = ? AND guildId = ?";

        const res = await conn.execute(query, [
            stats.totalExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF, 
            userId, guildId
        ]);

        return res[0].affectedRows > 0;
    }

    async upsert(userId, guildId, stats, transactionConn = null) {
        const updated = await this.update(userId, guildId, stats, transactionConn);

        if (!updated) {
            await this.insert(userId, guildId, stats, transactionConn);
        }
    }

    async updateSingleStat(userId, guildId, stat, newValue) {
        console.log(userId, guildId, stat, newValue);
        const conn = await this.getConnection();
        const query = "UPDATE STATS SET " + stat +" = ? WHERE userId = ? AND guildId = ?";
        const _res = await conn.execute(query, [newValue, userId, guildId]);
    }
}

module.exports = new StatsDAO();
