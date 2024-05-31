const MySQLDAO = require("./mySQLDAO");

class StatsDAO extends MySQLDAO {
    async clearGoldFromAll(guildId) {
        const conn = await this.getConnection();
        const query = "UPDATE STATS SET gold = 0 WHERE guildId = ?";
        const _res =  await conn.execute(query, [guildId]);
    }

    async insert(userId, guildId, stats) {
        const conn = await this.getConnection();
        const query = "INSERT INTO STATS (userId, guildId, totalExp, gold, currentHP, maxHP, tempHP, currentFP, maxFP, tempFP, currentSP, maxSP, tempSP, baseDEF) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        const _res = await conn.execute(query, [
            userId, guildId, 
            stats.totalExp, stats.gold, 
            stats.currentHP, stats.maxHP, stats.tempHP, 
            stats.currentFP, stats.maxFP, stats.tempFP, 
            stats.currentSP, stats.maxSP, stats.tempSP, 
            stats.baseDEF
        ]);
    }

    async update(userId, guildId, stats) {
        const conn = await this.getConnection();
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
}

module.exports = new StatsDAO();