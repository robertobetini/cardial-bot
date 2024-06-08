const userDAO = require("./../DAOs/userDAO");
const statsDAO = require("./../DAOs/statsDAO");
const User = require("../models/user");

class EconomyService {
    static async addGold(guildId, targetUser, goldAmount) {
        let user = await EconomyService.getOrCreateUser(guildId, targetUser);

        user.tryUpdateGold(goldAmount);

        await userDAO.upsert(user, true);
    }

    static async transferGold(guildId, partyUser, counterpartyUser, goldAmount) {
        let party = await EconomyService.getOrCreateUser(guildId, partyUser);
        let counterparty = await EconomyService.getOrCreateUser(guildId, counterpartyUser);

        party.tryUpdateGold(-goldAmount);
        counterparty.tryUpdateGold(goldAmount);

        await userDAO.batchUpsert([ party, counterparty ], true);
    }

    static async clearGoldFromAllUsers(guildId) {
        await statsDAO.clearGoldFromAll(guildId);
    }

    static async getOrCreateUser(guildId, userToGet) {
        let user = await userDAO.get(userToGet.id, guildId);
        
        if (!user) {
            user = new User(
                userToGet.id,
                guildId,
                userToGet.username,
                userToGet.displayAvatarURL()
            );
        }

        return user;
    }
}

module.exports = EconomyService;
