const userDAO = require("./../DAOs/userDAO");
const User = require("../models/user");

class ProgressionService {
    static async addExp(guildId, targetUser, expAmount) {
        let user = await userDAO.get(targetUser.id, guildId);

        if (!user) {
            user = new User(
                targetUser.id,
                guildId,
                targetUser.username
            );
        }

        user.addExp(expAmount);

        await userDAO.upsert(user);
    }
}

module.exports = ProgressionService;