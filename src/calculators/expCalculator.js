const Constants = require("../constants");

const minExpForLevel = [
          0,
          0,
        300,
        900,
      2_700,
      6_500,
     14_000,
     23_000,
     34_000,
     48_000,
     64_000,
     85_000,
    100_000,
    120_000,
    140_000,
    165_000,
    195_000,
    225_000,
    265_000,
    305_000,
    355_000
];

module.exports = {
    getLevelExp(level) {
        if (level >= 20) {
            return minExpForLevel[Constants.MAX_LEVEL] - minExpForLevel[Constants.MAX_LEVEL - 1];
        }

        return minExpForLevel[level + 1] - minExpForLevel[level];
    },
    getTotalLevelExp(level) {
        if (level > Constants.MAX_LEVEL) {
            return minExpForLevel[Constants.MAX_LEVEL];
        }
        return minExpForLevel[level];
    },
    getLevelFromExp(exp) {
        if (exp < 1) {
            return {
                lvl: 1,
                remainingExp: 0
            };
        }

        for (let level = 1; level < Constants.MAX_LEVEL; level++) {
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
            lvl: Constants.MAX_LEVEL,
            remainingExp: this.getLevelExp(Constants.MAX_LEVEL)
        };
        let level = 1;
        while (this.getTotalLevelExp(level) <= exp) {
            level++;
        }
        if (level > Constants.MAX_LEVEL) {
            return {
                lvl: Constants.MAX_LEVEL,
                remainingExp: getTotalLevelExp(Constants.MAX_LEVEL)
            };
        }
        level--;


        return {
            lvl: level,
            remainingExp: exp - this.getTotalLevelExp(level)
        }
    }
}
