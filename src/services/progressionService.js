const UserService = require("../services/userService");

class ProgressionService {
    static async addExp(guildId, targetUser, expAmount) {
        const user = await UserService.getOrCreateUser(guildId, targetUser);
        user.addExp(expAmount);
        await UserService.upsert(user, true);
    }
}

module.exports = ProgressionService;