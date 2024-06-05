const userDAO = require("../DAOs/userDAO");
const statsDAO = require("../DAOs/statsDAO");

class StatsService {
    static async getUserStats(userId, guildId) {
        return await userDAO.get(userId, guildId, false);
    }

    static async get(userId, guildId) {
        return await statsDAO.get(userId, guildId);
    }
}

module.exports = StatsService;
