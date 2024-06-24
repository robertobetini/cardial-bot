const attributesDAO = require("../DAOs/attributesDAO");
const UserService = require("../services/userService");
const StatsService = require("../services/statsService");

const { calculateAttributeMod } = require("../calculators/modCalculator");

class AttributesService {
    static async get(guildId, userId) {
        return await attributesDAO.get(userId, guildId);
    }

    static async update(attributes, propagateChangesToStats = false) {
        if (propagateChangesToStats) {     
            const user = await UserService.get(attributes.guildId, attributes.userId, true);
    
            const conModDiff = calculateAttributeMod(attributes.CON) - calculateAttributeMod(user.attributes.CON);
            if (conModDiff === 0) {
                return;
            }
            
            user.stats.maxHP += conModDiff;
            user.stats.currentHP +=conModDiff;
            await StatsService.update(user.stats);
        }

        return await attributesDAO.update(attributes.userId, attributes.guildId, attributes);
    }
}

module.exports = AttributesService;
