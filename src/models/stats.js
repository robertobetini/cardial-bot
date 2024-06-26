const expCalculator = require("../calculators/expCalculator");
const Constants = require("../constants");
const Logger = require("../logger");

class Stats {
    static maxLvl = Constants.MAX_LEVEL;

    constructor(userId, guildId, totalExp = 0, gold = 0) {
        this.userId = userId;
        this.guildId = guildId;

        this.totalExp = totalExp;
        this.exp = 0;
        this.gold = gold;
        this.lvl = 1;

        this.currentHP = Constants.BASE_HP;
        this.maxHP = Constants.BASE_HP;
        this.tempHP = 0;

        this.currentFP = Constants.BASE_FP;
        this.maxFP = Constants.BASE_FP;
        this.tempFP = 0;

        this.currentSP = Constants.BASE_SP;
        this.maxSP = Constants.BASE_SP;
        this.tempSP = 0;

        this.baseDEF = Constants.BASE_DEF;
        this.baseInitiative = Constants.BASE_INITIATIVE;

        this.updateExpAndLevel();
    }

    updateExpAndLevel(constrainLevel) {
        const result = expCalculator.getLevelFromExp(this.totalExp);

        if (constrainLevel) {
            if (result.lvl > this.lvl) {
                Logger.warn(`Constraining level up for player (${this.guildId}|${this.userId})`);
                this.exp = expCalculator.getLevelExp(this.lvl);
                this.totalExp = expCalculator.getTotalLevelExp(this.lvl) + this.exp;
            } else if (result.lvl < this.lvl) {
                Logger.warn(`Constraining level down for player (${this.guildId}|${this.userId})`);
                this.exp = 0;
                this.totalExp = expCalculator.getTotalLevelExp(this.lvl);
            } else {
                this.exp = result.remainingExp;        
            }
            return;
        }

        this.lvl = result.lvl;
        this.exp = result.remainingExp;
    }

    addExp(exp, constrainLevel) {
        let newTotalExp = this.totalExp + exp;

        if (newTotalExp < 0) {
            newTotalExp = 0;
        } else if (newTotalExp > expCalculator.getTotalLevelExp(this.maxLvl)) {
            newTotalExp = expCalculator.getTotalLevelExp(this.maxLvl);
        }

        this.totalExp = newTotalExp;
        this.updateExpAndLevel(constrainLevel);
    }

    tryUpdateGold(amount) {
        const newAmount = this.gold + amount;

        if (newAmount < 0) {
            throw new Error(`O usuário não possui saldo para suficiente para realizar o envio (\`Saldo atual: ${this.gold}\`).`);
        }

        this.gold = newAmount;
    }

    
    modifyStat(stat, amount) {
        let newValue = this[stat] + amount;
        newValue = newValue < 0 ? 0 : newValue;

        if (stat === "currentHP") {
            newValue = newValue > this.maxHP ? this.maxHP : newValue;
        } else if (stat === "currentFP") {
            newValue = newValue > this.maxFP ? this.maxFP : newValue;
        } else if (stat === "currentSP") {
            newValue = newValue > this.maxSP ? this.maxSP : newValue;
        }

        this[stat] = newValue;
    }

    static fromDTO(fullUserDTO) {
        if (!fullUserDTO) {
            return null;
        }

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
        stats.baseInitiative = fullUserDTO.baseInitiative;

        return stats;
    }
}

module.exports = Stats;
