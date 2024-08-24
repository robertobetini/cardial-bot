class Constants {
    static PERFORMANCE_MONITOR_CHANNEL_ID = process.env.PERFORMANCE_MONITOR_CHANNEL_ID;
    static BYTES_TO_MEGABYTES = 1024 * 1024;
    static MOBILE_LINE_SIZE = 33;
    static EMBED_FIELD_MAX_LENGTH = 1024;
    static PAGE_SIZE = parseInt(process.env.PAGE_SIZE);
    static MILLIS_IN_SECOND = 1000;
    static MINUTE_IN_MILLIS = 60 * 1000;
    static HOUR_IN_MILLIS = 60 * (60 * 1000);
    static DAY_IN_MILLIS = 24 * (60 * 60 * 1000);
    static POLL_DURATION_IN_HOURS = parseInt(process.env.POLL_DURATION_IN_HOURS) || 2;
    static MONITORING_INTERVAL_IN_SECONDS = parseInt(process.env.MONITORING_INTERVAL_IN_SECONDS) || 600;
    static INTERACTION_COLLECTOR_LIFETIME_IN_HOURS = parseInt(process.env.INTERACTION_COLLECTOR_LIFETIME_IN_HOURS);
    static BASE_SLOT_COUNT = parseInt(process.env.BASE_SLOT_COUNT);
    static ITEMS_PER_POLL = parseInt(process.env.ITEMS_PER_POLL);
    static MAX_LEVEL = 20;
    static MAX_MASTERY = 10;
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
    static NO_EXP_LEVEL_GAP = parseInt(process.env.NO_EXP_LEVEL_GAP);
    static COMMAND_MAX_USERS = 6;
    static COMMAND_MAX_MOBS = 6;
    static GOLD_ITEM_ID = "gold";
    static EPHEMERAL_COMMANDS = ["ficha", "atualiza", "zsync", "buscamob", "bestiario", "inventario", "additem"];
    static CHALLENGE_TO_ATTRIBUTE_MAP = {
        "athletics": "STR",
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
        "strength": "STR",
        "dexterity": "DEX",
        "constitution": "CON",
        "wisdom": "WIS",
        "charisma": "CHA",
        "STR": "STR",
        "DEX": "DEX",
        "CON": "CON",
        "WIS": "WIS",
        "CHA": "CHA"
    };
    static attributes = [
        { label: "Força", value: "STR" },
        { label: "Carisma", value: "CHA" },
        { label: "Destreza", value: "DEX" },
        { label: "Constituição", value: "CON" },
        { label: "Conhecimento", value: "WIS" },
    ];
    static stats = [ 
        { label: "🔴 HP atual", value: "currentHP" },
        { label: "🔴 HP temp", value: "tempHP" },
        { label: "🔵 FP atual", value: "currentFP" },
        { label: "🔵 FP temp", value: "tempFP" },
        { label: "🟣 SP atual", value: "currentSP" },
        { label: "🟣 SP temp", value: "tempSP" }
    ];
    static sensibleStats = [ 
        { label: "🔴 HP max", value: "maxHP" },
        { label: "🔵 FP max", value: "maxFP" },
        { label: "🟣 SP max", value: "maxSP" },
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
        { label: "Força", value: "strength" },
        { label: "Destreza", value: "dexterity" },
        { label: "Constituição", value: "constitution" },
        { label: "Conhecimento", value: "wisdom" },
        { label: "Carisma", value: "charisma" }
    ];
    static possibleSkillValues = [
        { label: "Sem proficiência", value: "NoProficiency" },
        { label: "Proficiente", value: "Proficient" },
        { label: "Especialista", value: "Specialist" },
    ];
    static emojiMap = {
        "STR": "💪🏼",
        "DEX": "🎯",
        "CON": "❤️",
        "WIS": "🧠",
        "CHA": "🎭"
    }
    static challenges = [
        ...Constants.skills.map(({ label, value }) => ({ label: `${Constants.emojiMap[Constants.CHALLENGE_TO_ATTRIBUTE_MAP[value]]} ${label}`, value })),
        ...Constants.attributes.map(({ label, value }) => ({ label: `[Atributo] ${Constants.emojiMap[Constants.CHALLENGE_TO_ATTRIBUTE_MAP[value]]} ${label}`, value }))
    ];
    static TRANSLATION = {
        "NoProficiency": "Não",
        "Proficient": "Prof.",
        "Specialist": "Esp.",
        "STR": "For",
        "DEX": "Des",
        "CON": "Const",
        "WIS": "Con",
        "CHA": "Car",
        "weapon": "Arma",
        "shield": "Escudo",
        "armor": "Armadura",
        "damage": "Dano",
        "damageType": "Tipo de dano",
        "weaponType": "Tipo de arma",
        "properties": "Propriedades",
        "metal": "Metal",
        "effects": "Efeitos",
        "strRequirement": "Requisito de força",
        "CA": "CA",
        "grip": "Empunhadura",
        "STR": "For",
        "stealth": "Furtividade",
        "other": "Outro",
        "usable": "Consumível",
        "itemType": "Tipo de item",
        "runes": "Runas",
        "unique": "Único",
        "dexDebuff": "Destreza",
        "acessory": "Acessório",
        "acessoryType": "Tipo de acessório",
        "slots": "Slots",
        "disvantage": "Desvantagem"
    };
};

module.exports = Constants;
