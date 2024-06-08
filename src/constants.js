const Constants = {
    MAX_LEVEL: 20,
    MIN_ATTRIBUTE_VALUE: 7,
    MAX_ATTRIBUTE_VALUE_FOR_FIRST_TIME: 15,
    MAX_ATTRIBUTE_VALUE: 30,
    BASE_HP: 10,
    BASE_FP: 2,
    BASE_SP: 25,
    BASE_DEF: 10,
    BASE_INITIATIVE: 10,
    BASE_MAX_HP_PER_LEVEL: 6,
    BASE_MAX_FP_PER_LEVEL: 2,
    BASE_MAX_SP_PER_LEVEL: 0,
    INITIAL_AVAILABLE_ATTRIBUTES: 25,
    ATTRIBUTE_PER_LEVEL: 1,
    attributes: [
        { label: "Força", value: "FOR" },
        { label: "Destreza", value: "DEX" },
        { label: "Constituição", value: "CON" },
        { label: "Conhecimento", value: "WIS" },
        { label: "Carisma", value: "CHA" }
    ],
    stats: [ 
        { label: "🔴 HP atual", value: "currentHP" },
        { label: "🔴 HP max", value: "maxHP" },
        { label: "🔴 HP temp", value: "tempHP" },
        { label: "🔵 FP atual", value: "currentFP" },
        { label: "🔵 FP max", value: "maxFP" },
        { label: "🔵 FP temp", value: "tempFP" },
        { label: "🟣 SP atual", value: "currentSP" },
        { label: "🟣 SP max", value: "maxSP" },
        { label: "🟣 SP temp", value: "tempSP" },
        { label: "🛡️ DEF", value: "baseDEF" }
    ],
    skills: [
        { label: "Atletismo", value: "athletics" },
        { label: "Acrobacia", value: "acrobatics" },
        { label: "Prestidigitação", value: "jugglery" },
        { label: "Furtividade", value: "stealth" },
        { label: "Adestrar animais", value: "animalTraining" },
        { label: "Intuição", value: "intuition" },
        { label: "Investigação", value: "investigation" },
        { label: "Natureza", value: "nature" },
        { label: "Percepção", value: "perception" },
        { label: "Sobrevivência", value: "survivability" },
        { label: "Enganação", value: "deception" },
        { label: "Intimidação", value: "intimidation" },
        { label: "Performance", value: "performance" },
        { label: "Persuasão", value: "persuasion" }
    ],
    possibleSkillValues: [
        { label: "Sem proficiência", value: "NoProficiency" },
        { label: "Proficiente", value: "Proficient" },
        { label: "Especialista", value: "Specialist" },
    ]
};

module.exports = Constants;
