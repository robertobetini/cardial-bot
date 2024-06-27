require('dotenv').config();

const UserService = require("../src/services/userService");
const StatsService = require("../src/services/statsService");
const AttributesService = require("../src/services/attributesService");

const Constants = require("../src/constants");
const { calculateAttributeMod } = require("../src/calculators/modCalculator");

const setInitialStats = (attributes) => {
    const currentStats = StatsService.get(attributes.userId, attributes.guildId);

    currentStats.maxHP = Constants.BASE_HP + calculateAttributeMod(attributes.CON);

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

console.log("Finished: fixInitialValues.js");
