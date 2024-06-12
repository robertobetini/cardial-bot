const userDAO = require("./../DAOs/userDAO");
const statsDAO = require("./../DAOs/statsDAO");
const UserService = require("../services/userService");

class EconomyService {
    static async addGold(guildId, targetUser, goldAmount) {
        let user = await UserService.getOrCreateUser(guildId, targetUser);
        user.tryUpdateGold(goldAmount);
        await UserService.upsert(user, true);
    }

    static async transferGold(guildId, partyUser, counterpartyUser, goldAmount) {
        //TODO: refatorar pra usar promise.all
        let party = await UserService.getOrCreateUser(guildId, partyUser);
        let counterparty = await UserService.getOrCreateUser(guildId, counterpartyUser);

        party.tryUpdateGold(-goldAmount);
        counterparty.tryUpdateGold(goldAmount);

        await userDAO.batchUpsert([ party, counterparty ], true);
    }

    static async clearGoldFromAllUsers(guildId) {
        await statsDAO.clearGoldFromAll(guildId);
    }
}

module.exports = EconomyService;
