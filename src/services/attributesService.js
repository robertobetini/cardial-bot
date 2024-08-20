const attributesDAO = require("../DAOs/attributesDAO");
const UserService = require("../services/userService");
const StatsService = require("../services/statsService");

const { calculateAttributeMod } = require("../calculators/modCalculator");

class AttributesService {
    static get(guildId, userId) {
        return attributesDAO.get(userId, guildId);
    }

    static update(attributes, propagateChangesToStats = false) {
        if (propagateChangesToStats) {     
            const user = UserService.get(attributes.guildId, attributes.userId, true);
    
            const conModDiff = calculateAttributeMod(attributes.CON) - calculateAttributeMod(user.attributes.CON);
            if (conModDiff !== 0) {
                user.stats.HP.max += conModDiff;
                user.stats.HP.current += conModDiff;
                StatsService.update(user.stats);
            }
        }

        return attributesDAO.update(attributes.userId, attributes.guildId, attributes);
    }
}

module.exports = AttributesService;
