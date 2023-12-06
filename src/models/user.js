const expCalculator = require("../expCalculator");

class User {
    static maxLvl = 20;

    constructor(userId, guildId, name, gold = 0, exp = 0) {
        this.userId = userId;
        this.guildId = guildId;
        this.username = name;
        this.gold = gold;
        this.totalExp = exp;

        this.updateExpAndLevel();
    }

    updateExpAndLevel() {
        const result = expCalculator.getLevelFromExp(this.totalExp);
        this.lvl = result.lvl;
        this.exp = result.remainingExp;
    }

    addExp(exp) {
        let newTotalExp = this.totalExp + exp;

        if (newTotalExp < 0) {
            newTotalExp = 0;
        } else if (newTotalExp > expCalculator.getTotalLevelExp(this.maxLvl)) {
            newTotalExp = expCalculator.getTotalLevelExp(this.maxLvl);
        }

        this.totalExp = newTotalExp;
        this.updateExpAndLevel();
    }

    tryUpdateGold(amount) {
        const newAmount = this.gold + amount;

        if (newAmount < 0) {
            throw new Error(`O usuário não possui saldo para suficiente para ser removido (Saldo atual: $${this.gold}).`);
        }

        this.gold = newAmount;
    }

    static fromDTO(userDTO) {
        return new User(
            userDTO.userId, 
            userDTO.guildId,
            userDTO.username,
            userDTO.gold,
            userDTO.totalExp);
    }
}

module.exports = User;
