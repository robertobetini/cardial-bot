class ExpCalculator {
    constructor(minExpForLevel, maxLevel = null) {
        this.minExpForLevel = minExpForLevel;
        this.maxLevel = maxLevel || minExpForLevel.length - 1;
    }

    getLevelExp(level) {
        return level >= this.maxLevel
            ? this.minExpForLevel[this.maxLevel] - this.minExpForLevel[this.maxLevel - 1]
            : this.minExpForLevel[level + 1] - this.minExpForLevel[level];
    }

    getTotalLevelExp(level) {
        return level > this.maxLevel ? this.minExpForLevel[this.maxLevel] : this.minExpForLevel[level];
    }

    getLevelFromExp(exp) {
        if (exp < 1) {
            return {
                lvl: 1,
                remainingExp: 0
            };
        }
        
        for (let level = 1; level < this.maxLevel; level++) {
            const totalLevelExp = this.getTotalLevelExp(level);
            if (totalLevelExp > exp) {
                return {
                    lvl: level - 1,
                    remainingExp: exp - this.getTotalLevelExp(level - 1)
                };
            } 

            if (totalLevelExp === exp) {
                return {
                    lvl: level,
                    remainingExp: 0
                };
            }
        }

        return {
            lvl: this.maxLevel,
            remainingExp: this.getLevelExp(this.maxLevel)
        };
    }
}

module.exports = ExpCalculator;
