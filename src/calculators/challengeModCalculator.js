const { calculateAttributeMod, calculateProficiencyBonus } = require("./modCalculator");

const SKILL_TO_ATTRIBUTE_MAP = {
    "athletics": "FOR",
    "acrobatics": "DEX",
    "jugglery": "DEX",
    "stealth": "DEX",
    "animalTraining": "WIS",
    "intuition": "WIS",
    "investigation": "WIS",
    "nature": "WIS",
    "perception": "WIS",
    "survivability": "WIS",
    "deception": "CHA",
    "intimidation": "CHA",
    "performance": "CHA",
    "persuasion": "CHA"
};

const PROFICIENCY_LEVEL_MULTIPLIERS = {
    "NoProficiency": 0,
    "Proficient": 1,
    "Specialist": 2,
};

module.exports = {
    calculateChallengeMod(challenge, user) {
        const proficiencyBonus = calculateProficiencyBonus(user.stats.lvl);
        const attribute = SKILL_TO_ATTRIBUTE_MAP[challenge];
        const attributeMod = calculateAttributeMod(user.attributes[attribute]);
        const proficiencyMod = proficiencyBonus * PROFICIENCY_LEVEL_MULTIPLIERS[user.skills[challenge]];
        return attributeMod + proficiencyMod;
    }
}