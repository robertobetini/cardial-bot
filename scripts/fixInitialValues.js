require('dotenv').config();

const UserService = require("../src/services/userService");
const StatsService = require("../src/services/statsService");
const AttributesService = require("../src/services/attributesService");

const Constants = require("../src/constants");
const { calculateAttributeMod } = require("../src/calculators/modCalculator");

const setInitialStats = (attributes) => {
    const currentStats = StatsService.get(attributes.userId, attributes.guildId);

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

    StatsService.update(currentStats);
}

const users = UserService.getAllFromGuild("1179922738677284874");
for (const user of users) {
    if (user.stats.lvl > 1) {
        continue;
    }

    const attributes = AttributesService.get(user.guildId, user.userId);
    setInitialStats(attributes);
}
