const userDAO = require("../DAOs/userDAO");
const statsDAO = require("../DAOs/statsDAO");

const Constants = require("../constants");

const { calculateAttributeMod } = require("../calculators/modCalculator");

class StatsService {
    static getUserStats(userId, guildId) {
        return userDAO.get(userId, guildId, false);
    }

    static get(userId, guildId) {
        return statsDAO.get(userId, guildId);
    }

    static updateSingleStat(userId, guildId, stat, newValue) {
        return statsDAO.updateSingleStat(userId, guildId, stat, newValue);
    }

    static update(stats) {
        return statsDAO.update(stats.userId, stats.guildId, stats);
    }

    static setInitialStats(attributes) {
        const currentStats = this.get(attributes.userId, attributes.guildId);

        const maxHP = Constants.BASE_HP + calculateAttributeMod(attributes.CON);
        const maxFP = Constants.BASE_FP;
        const maxSP = Constants.BASE_SP;

        currentStats.HP.set(maxHP, maxHP, 0);
        currentStats.FP.set(maxFP, maxFP, 0);
        currentStats.SP.set(maxSP, maxSP, 0);

        currentStats.baseDEF = Constants.BASE_DEF;
        currentStats.baseInitiative = Constants.BASE_INITIATIVE;

        currentStats.gold = Constants.INITIAL_GOLD;

        this.update(currentStats);
    }
}

module.exports = StatsService;
