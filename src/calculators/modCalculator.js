const Constants = require("../constants");

const MIN_ATTR_MOD = -5
const MIN_PROF_MOD = 2;

const attrModTable = [MIN_ATTR_MOD];
for (let i = 1; i < Constants.MAX_ATTRIBUTE_VALUE + 1; i++) {
    const val = MIN_ATTR_MOD + Math.floor(i / 2);
    attrModTable.push(val);
}

const proficiencyModTable = [0];
for (let i = 0; i < Constants.MAX_LEVEL; i++) {
    const val = MIN_PROF_MOD + Math.floor(i / 4);
    proficiencyModTable.push(val);
}

module.exports = {
    calculateAttributeMod(value) {
        return attrModTable[value];
    },
    calculateProficiencyMod(level) {
        return proficiencyModTable[level];
    }
}
