const userDAO = require("../DAOs/userDAO");
const statsDAO = require("../DAOs/statsDAO");

const Constants = require("../constants");

const { calculateAttributeMod } = require("../calculators/modCalculator");



class StatsService {
    static async getUserStats(userId, guildId) {
        return await userDAO.get(userId, guildId, false);
    }

    static async get(userId, guildId) {
        return await statsDAO.get(userId, guildId);
    }

    static async updateSingleStat(userId, guildId, stat, newValue) {
        return await statsDAO.updateSingleStat(userId, guildId, stat, newValue);
    }

    static async update(stats) {
        return await statsDAO.update(stats.userId, stats.guildId, stats);
    }

    static async setInitialStats(attributes) {
        const currentStats = await this.get(attributes.userId, attributes.guildId);

        const maxHP = Constants.BASE_HP + calculateAttributeMod(attributes.CON);
        currentStats.maxHP = maxHP;
        currentStats.currentHP = maxHP;
        currentStats.tempHP = 0;

        const maxFP = Constants.BASE_FP;
        currentStats.maxFP = maxFP;
        currentStats.currentFP = maxFP;
        currentStats.tempFP = 0;

        const maxSP = Constants.BASE_SP;
        currentStats.maxSP = maxSP;
        currentStats.currentSP = maxSP;
        currentStats.tempSP = 0;

        currentStats.baseDEF = Constants.BASE_DEF;
        currentStats.baseInitiative = Constants.BASE_INITIATIVE;

        await this.update(currentStats);
    }
}

module.exports = StatsService;
