const { calculateAttributeMod, calculateProficiencyBonus } = require("./modCalculator");
const Constants = require("../constants");

const PROFICIENCY_LEVEL_MULTIPLIERS = {
    "NoProficiency": 0,
    "Proficient": 1,
    "Specialist": 2,
};

module.exports = {
    calculateChallengeMod(challenge, user) {
        const proficiencyBonus = calculateProficiencyBonus(user.stats.lvl);
        const attribute = Constants.SKILL_TO_ATTRIBUTE_MAP[challenge];
        const attributeMod = calculateAttributeMod(user.attributes[attribute]);
        const proficiencyMod = proficiencyBonus * PROFICIENCY_LEVEL_MULTIPLIERS[user.skills[challenge]] || 0;
        return attributeMod + proficiencyMod;
    }
}