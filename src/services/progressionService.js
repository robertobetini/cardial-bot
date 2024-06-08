const UserService = require("../services/userService");

class ProgressionService {
    static async addExp(guildId, targetUser, expAmount) {
        const user = await UserService.getOrCreateUser(targetUser.id, guildId);
        user.addExp(expAmount);
        await UserService.upsert(user, true);
    }
}

module.exports = ProgressionService;