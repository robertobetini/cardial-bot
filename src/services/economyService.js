const userDAO = require("./../DAOs/userDAO");
const statsDAO = require("./../DAOs/statsDAO");
const User = require("../models/user");

class EconomyService {
    static async addGold(guildId, targetUser, goldAmount) {
        let user = await userDAO.get(targetUser.id, guildId);
        
        if (!user) {
            user = new User(
                targetUser.id,
                guildId,
                targetUser.username
            );
        }

        user.tryUpdateGold(goldAmount);

        await userDAO.upsert(user, true);
    }

    static async transferGold(guildId, partyUser, counterpartyUser, goldAmount) {
        let party = await userDAO.get(partyUser.id, guildId);
        if (!party) {
            party = new User(
                partyUser.id,
                guildId,
                partyUser.username
            );
        }

        let counterparty = await userDAO.get(counterpartyUser.id, guildId);
        if (!counterparty) {
            counterparty = new User(
                counterpartyUser.id,
                guildId,
                counterpartyUser.username
            );
        }

        party.tryUpdateGold(-goldAmount);
        counterparty.tryUpdateGold(goldAmount);

        await userDAO.batchUpsert([ party, counterparty ], true);
    }

    static async clearGoldFromAllUsers(guildId) {
        await statsDAO.clearGoldFromAll(guildId);
    }
}

module.exports = EconomyService;
