const userDAO = require("../DAOs/userDAO");
const User = require("../models/user");

class UserService {
    static async get(guildId, userId, fullUser = true) {
        return await userDAO.get(userId, guildId, fullUser);
    }

    static async getOrCreateUser(guildId, userToGet, fullUser = true) {
        let user = await UserService.get(guildId, userToGet.id, fullUser);
        
        if (!user) {
            user = new User(
                userToGet.id,
                guildId,
                userToGet.username,
                userToGet.displayAvatarURL()
            );

            userDAO.insert(user, fullUser);
        }

        return user;
    }

    static async upsert(user, deepUpsert) {
        await userDAO.upsert(user, deepUpsert);
    }

    static async batchUpsert(users, deepUpsert) {
        await userDAO.batchUpsert(users, deepUpsert);
    }

    static async getAllFromGuild(guildId, orderby, skip, limit) {
        return await userDAO.getAllFromGuild(guildId, orderby, skip, limit);
    }
}

module.exports = UserService;
