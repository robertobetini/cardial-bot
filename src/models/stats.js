const playerExpCalculator = require("../calculators/playerExpCalculator");
const masteryExpCalculator = require("../calculators/masteryExpCalculator");

const StatsBar = require("./statsBar");
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

        this.HP = new StatsBar("HP", Constants.BASE_HP, Constants.BASE_HP);
        this.FP = new StatsBar("FP", Constants.BASE_FP, Constants.BASE_FP);
        this.SP = new StatsBar("SP", Constants.BASE_SP, Constants.BASE_SP);

        this.baseDEF = Constants.BASE_DEF;
        this.baseInitiative = Constants.BASE_INITIATIVE;
        this.extraSlots = 0;

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
            this.HP.increaseCurrent(amount);
        } else if (stat === "currentFP") {
            this.FP.increaseCurrent(amount);
        } else if (stat === "currentSP") {
            this.SP.increaseCurrent(amount);
        } else if (stat === "maxHP") {
            this.HP.increaseMax(amount);
        } else if (stat === "maxFP") {
            this.FP.increaseMax(amount);
        } else if (stat === "maxSP") {
            this.SP.increaseMax(amount);
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

        stats.baseDEF = fullUserDTO.baseDEF;
        stats.baseInitiative = fullUserDTO.baseInitiative;
        stats.extraSlots = fullUserDTO.extraSlots;

        stats.HP.set(fullUserDTO.currentHP, fullUserDTO.maxHP, fullUserDTO.tempHP);
        stats.FP.set(fullUserDTO.currentFP, fullUserDTO.maxFP, fullUserDTO.tempFP);
        stats.SP.set(fullUserDTO.currentSP, fullUserDTO.maxSP, fullUserDTO.tempSP);

        return stats;
    }
}

module.exports = Stats;
