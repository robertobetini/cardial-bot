const totalLevelExpCache = {};

module.exports = {
    getLevelExp(level) {
        return level*50;
    },
    getTotalLevelExp(level) {
        if (!totalLevelExpCache[level]) {
            totalLevelExpCache[level] = (this.getLevelExp(0) + this.getLevelExp(level - 1)) * level / 2;
        }

        return totalLevelExpCache[level];
    },
    getLevelFromExp(exp) {
        let level = 1;
        while (this.getTotalLevelExp(level + 1) < exp) {
            level++;
        }

        return {
            lvl: level,
            remainingExp: exp - this.getTotalLevelExp(level)
        }
    }
}
