const UserService = require("../services/userService");

class ProgressionService {
    static addExp(guildId, targetUser, expAmount) {
        const user = UserService.getOrCreateUser(guildId, targetUser);
        user.addExp(expAmount);
        UserService.upsert(user, true);
    }
}

module.exports = ProgressionService;