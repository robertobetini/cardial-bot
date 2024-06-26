const userDAO = require("./../DAOs/userDAO");
const statsDAO = require("./../DAOs/statsDAO");
const UserService = require("../services/userService");

class EconomyService {
    static addGoldToSingleUser(guildId, target, amount) {
        const user = UserService.get(guildId, target.id, true);
        if (!user) {
            throw new Error("Jogador não possui ficha ou ela ainda não está concluída.");
        }

        user.tryUpdateGold(amount);
        UserService.upsert(user, true);
    }

    static addGold(users, goldAmount) {
        for (let user of users) {
            if (!user) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }

            user.tryUpdateGold(goldAmount);
        }

        UserService.batchUpsert(users, true);
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
