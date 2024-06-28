class Constants {
    static MOBILE_LINE_SIZE = 33;
    static PAGE_SIZE = parseInt(process.env.PAGE_SIZE);
    static MILLIS_IN_SECOND = 1000;
    static MINUTE_IN_MILLIS = 60 * 1000;
    static HOUR_IN_MILLIS = 60 * (60 * 1000);
    static DAY_IN_MILLIS = 24 * (60 * 60 * 1000);
    static MAX_LEVEL = 20;
    static MIN_ATTRIBUTE_VALUE = 7;
    static MAX_ATTRIBUTE_VALUE_FOR_FIRST_TIME = 15;
    static MAX_ATTRIBUTE_VALUE = 30;
    static BASE_HP = 10;
    static BASE_FP = 2;
    static BASE_SP = 25;
    static BASE_DEF = 10;
    static BASE_INITIATIVE = 10;
    static BASE_MAX_HP_PER_LEVEL = 6;
    static BASE_MAX_FP_PER_LEVEL = 2;
    static BASE_MAX_SP_PER_LEVEL = 0;
    static INITIAL_GOLD = 1000;
    static INITIAL_AVAILABLE_ATTRIBUTES = parseInt(process.env.INITIAL_AVAILABLE_ATTRIBUTES);
    static ATTRIBUTE_PER_LEVEL = 1;
    static COMMAND_MAX_USERS = 6;
    static EPHEMERAL_COMMANDS = ["ficha", "atualizastatus", "atualizanickname"];
    static CHALLENGE_TO_ATTRIBUTE_MAP = {
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
        "persuasion": "CHA",
        "FOR": "FOR",
        "DEX": "DEX",
        "CON": "CON",
        "WIS": "WIS",
        "CHA": "CHA"
    };
    static attributes = [
        { label: "Força", value: "FOR" },
        { label: "Carisma", value: "CHA" },
        { label: "Destreza", value: "DEX" },
        { label: "Constituição", value: "CON" },
        { label: "Conhecimento", value: "WIS" },
    ];
    static stats = [ 
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
    ];
    static skills = [
        { label: "Acrobacia", value: "acrobatics" },
        { label: "Adestrar animais", value: "animalTraining" },
        { label: "Atletismo", value: "athletics" },
        { label: "Enganação", value: "deception" },
        { label: "Furtividade", value: "stealth" },
        { label: "Intimidação", value: "intimidation" },
        { label: "Intuição", value: "intuition" },
        { label: "Investigação", value: "investigation" },
        { label: "Natureza", value: "nature" },
        { label: "Percepção", value: "perception" },
        { label: "Performance", value: "performance" },
        { label: "Persuasão", value: "persuasion" },
        { label: "Prestidigitação", value: "jugglery" },
        { label: "Sobrevivência", value: "survivability" },
    ];
    static possibleSkillValues = [
        { label: "Sem proficiência", value: "NoProficiency" },
        { label: "Proficiente", value: "Proficient" },
        { label: "Especialista", value: "Specialist" },
    ];
    static challenges = [...Constants.skills, ...Constants.attributes];
};

console.log(Constants.challenges);

module.exports = Constants;
