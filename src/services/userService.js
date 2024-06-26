const userDAO = require("../DAOs/userDAO");
const User = require("../models/user");

const Logger = require("../logger");

class UserService {
    static get(guildId, userId, fullUser = true) {
        return userDAO.get(userId, guildId, fullUser);
    }

    static getOrCreateUser(guildId, userToGet, fullUser = true) {
        let user = UserService.get(guildId, userToGet.id, fullUser);
        
        if (!user) {
            user = new User(
                userToGet.id,
                guildId,
                userToGet.username,
                userToGet.displayAvatarURL()
            );

            Logger.info(`Creating user for ${user.username}`);
            userDAO.insert(user, fullUser);
        }

        return user;
    }

    static upsert(user, deepUpsert) {
        userDAO.upsert(user, deepUpsert);
    }

    static batchUpsert(users, deepUpsert) {
        userDAO.batchUpsert(users, deepUpsert);
    }

    static getAllFromGuild(guildId, orderby, skip, limit) {
        return userDAO.getAllFromGuild(guildId, orderby, skip, limit);
    }
}

module.exports = UserService;
