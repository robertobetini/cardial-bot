const expCalculator = require("../expCalculator");

class Stats {
    static maxLvl = 20;

    constructor(userId, guildId, totalExp = 0, gold = 0) {
        this.userId = userId;
        this.guildId = guildId;

        this.totalExp = totalExp;
        this.exp = 0;
        this.gold = gold;
        this.lvl = 1;

        this.currentHP = 10;
        this.maxHP = 10;
        this.tempHP = 0;

        this.currentFP = 10;
        this.maxFP = 10;
        this.tempFP = 0;

        this.currentSP = 5;
        this.maxSP = 5;
        this.tempSP = 0;

        this.baseDEF = 10;

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

    static fromDTO(fullUserDTO) {
        const stats = new Stats(
            fullUserDTO.userId,
            fullUserDTO.guildId,
            fullUserDTO.totalExp,
            fullUserDTO.gold
        );

        stats.currentHP = fullUserDTO.currentHP;
        stats.maxHP = fullUserDTO.maxHP;
        stats.tempHP = fullUserDTO.tempHP;

        stats.currentFP = fullUserDTO.currentFP;
        stats.maxFP = fullUserDTO.maxFP;
        stats.tempFP = fullUserDTO.tempFP;

        stats.currentSP = fullUserDTO.currentSP;
        stats.maxSP = fullUserDTO.maxSP;
        stats.tempSP = fullUserDTO.tempSP;

        stats.baseDEF = fullUserDTO.baseDEF;

        return stats;
    }
}

module.exports = Stats;
