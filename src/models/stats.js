const playerExpCalculator = require("../calculators/playerExpCalculator");
const masteryExpCalculator = require("../calculators/masteryExpCalculator");

const Constants = require("../constants");
const Logger = require("../logger");

class Stats {
    static maxMastery = Constants.MAX_MASTERY;

    constructor(userId, guildId, totalExp = 0, gold = 0, totalMasteryExp = 0) {
        this.userId = userId;
        this.guildId = guildId;

        this.totalExp = totalExp;
        this.totalMasteryExp = totalMasteryExp;
        this.exp = 0;
        this.masteryExp = 0;
        this.gold = gold;
        this.lvl = 1;
        this.mastery = 1;

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
        const result = playerExpCalculator.getLevelFromExp(this.totalExp);
        const masteryResult = masteryExpCalculator.getLevelFromExp(this.totalMasteryExp);

        if (constrainLevel) {
            if (result.lvl > this.lvl) {
                Logger.warn(`Constraining level up for player (${this.guildId}|${this.userId})`);
                this.exp = playerExpCalculator.getLevelExp(this.lvl);
                this.totalExp = playerExpCalculator.getTotalLevelExp(this.lvl) + this.exp;
            } else if (result.lvl < this.lvl) {
                Logger.warn(`Constraining level down for player (${this.guildId}|${this.userId})`);
                this.exp = 0;
                this.totalExp = playerExpCalculator.getTotalLevelExp(this.lvl);
            } else {
                this.exp = result.remainingExp;        
            }
            return;
        }

        this.lvl = result.lvl;
        this.exp = result.remainingExp;

        this.mastery = masteryResult.lvl;
        this.masteryExp = masteryResult.remainingExp;
    }

    addExp(exp, constrainLevel) {
        let newTotalExp = this.totalExp + exp;

        if (newTotalExp < 0) {
            newTotalExp = 0;
        } else if (newTotalExp > playerExpCalculator.getTotalLevelExp(Constants.MAX_LEVEL)) {
            newTotalExp = playerExpCalculator.getTotalLevelExp(Constants.MAX_LEVEL);
        }

        this.totalExp = newTotalExp;
        this.updateExpAndLevel(constrainLevel);
    }

    addMasteryExp(exp) {
        let newTotalExp = this.totalMasteryExp + exp;

        if (newTotalExp < 0) {
            newTotalExp = 0;
        } else if (newTotalExp > masteryExpCalculator.getTotalLevelExp(Constants.MAX_MASTERY)) {
            newTotalExp = masteryExpCalculator.getTotalLevelExp(Constants.MAX_MASTERY);
        }

        this.totalMasteryExp = newTotalExp;
        this.updateExpAndLevel();
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
            fullUserDTO.gold,
            fullUserDTO.totalMasteryExp
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
