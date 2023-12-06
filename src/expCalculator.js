module.exports = {
    getLevelExp(level) {
        return level*50;
    },
    getTotalLevelExp(level) {
        return (this.getLevelExp(0) + this.getLevelExp(level - 1)) * level / 2;
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
