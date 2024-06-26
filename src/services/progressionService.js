const UserService = require("../services/userService");

class ProgressionService {
    static addExp(users, expAmount, constrainLevel = false) {
        for (let user of users) {
            if (!user) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }

            user.addExp(expAmount, constrainLevel);
        }

        UserService.batchUpsert(users, true);
    }
}

module.exports = ProgressionService;