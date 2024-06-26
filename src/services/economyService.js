const userDAO = require("./../DAOs/userDAO");
const statsDAO = require("./../DAOs/statsDAO");
const UserService = require("../services/userService");

class EconomyService {
    static addGold(guildId, targetUser, goldAmount) {
        let user = UserService.getOrCreateUser(guildId, targetUser);
        user.tryUpdateGold(goldAmount);
        UserService.upsert(user, true);
    }

    static transferGold(guildId, partyUser, counterpartyUser, goldAmount) {
        const party = UserService.getOrCreateUser(guildId, partyUser);
        const counterparty = UserService.getOrCreateUser(guildId, counterpartyUser);

        party.tryUpdateGold(-goldAmount);
        counterparty.tryUpdateGold(goldAmount);

        userDAO.batchUpsert([ party, counterparty ], true);
    }

    static clearGoldFromAllUsers(guildId) {
        statsDAO.clearGoldFromAll(guildId);
    }
}

module.exports = EconomyService;
