const expCalculator = require("../expCalculator");

class Stats {
    static maxLvl = 20;

    constructor(userId, guildId, totalExp = 0, gold = 0) {
        this.userId = userId;
        this.guildId = guildId;

        this.totalExp = totalExp;
        this.exp = 0;
        this.gold = gold;
        this.lvl = 0;

        this.currentHP = null;
        this.maxHP = null;
        this.tempHP = null;

        this.currentFP = null;
        this.maxFP = null;
        this.tempFP = null;

        this.currentSP = null;
        this.maxSP = null;
        this.tempSP = null;

        this.baseDEF = null;

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
}

module.exports = Stats;