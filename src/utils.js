const crypto = require("node:crypto");
const URL = require("url").URL;

const { calculateAttributeMod } = require("./calculators/modCalculator");

const swap = (arr, i, j) => { 
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

const hashText = (text) => {
    return crypto.createHash('md5').update(text).digest('hex');
}

const shuffle = (arr, times = 100) => {
    if (!arr) {
        return arr;
    }

    for (let i = 0; i < times; i++) {
        const j = Math.floor(Math.random() * arr.length);
        const k = Math.floor(Math.random() * arr.length);
        swap(arr, j, k);
    }
}

const orderByInitiativeComparer = (a, b, desc = false) => {
    const bInitiative = b.stats.baseInitiative + calculateAttributeMod(b.attributes.DEX);
    const aInitiative = a.stats.baseInitiative + calculateAttributeMod(a.attributes.DEX);
    
    return desc ? bInitiative - aInitiative : aInitiative - bInitiative;
}

const orderByAttributeComparer = (a, b, attribute, desc = false) => {
    const aAttribute = a.attributes[attribute];
    const bAttriubte = b.attributes[attribute];

    return desc ? bAttriubte - aAttribute : aAttribute - bAttriubte;
}

const setCombatOrder = (a, b) => {
    const initiativeResult = orderByInitiativeComparer(a, b, true);

    if (initiativeResult === 0) {
        const dexResult = orderByAttributeComparer(a, b, "DEX", true);

        if (dexResult === 0) {
            return orderByAttributeComparer(a, b, "STR", true);
        }

        return dexResult;
    }

    return initiativeResult;
}

let monsterIdToNameMap = {};
const loadMonsterIdToNameMap = () => {
    const MonsterService = require("./services/monsterService");
    
    if (Object.keys(monsterIdToNameMap).length > 0) {
        return monsterIdToNameMap;
    }

    const allMonsters = MonsterService.getAll(false);
    allMonsters.map(m => monsterIdToNameMap[m.id] = m.name);

    return monsterIdToNameMap;
}

const clearMonsterIdToNameMap = () => monsterIdToNameMap = {};

module.exports = {
    randomId: (length) => Math.floor(Math.random() * Math.pow(10, length)).toString(),
    randomUUID: () => crypto.randomUUID(),
    hashText,
    shuffle,
    isValidUrl: (urlString) => {
        try {
            if (!urlString) {
                return false;
            }

            if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
                return false;
            }

            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    },
    orderByInitiativeComparer,
    orderByAttributeComparer,
    setCombatOrder,
    loadMonsterIdToNameMap,
    clearMonsterIdToNameMap,
    unityOfWork: (func) => {
        const Sqlite3DAO = require("./DAOs/sqlite3DAO");
        const execute = Sqlite3DAO.db.transaction(async () => {
            try {
                return await func();
            } catch (err) {
                if (!Sqlite3DAO.db.inTransaction) {
                    throw err;
                }
            }
        });
        return execute();
    }
};