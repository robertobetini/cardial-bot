const URL = require("url").URL;

const { calculateAttributeMod } = require("./calculators/modCalculator");

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

module.exports = {
    randomId: (length) => Math.floor(Math.random() * Math.pow(10, length)).toString(),
    isValidUrl: (urlString) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    },
    orderByInitiativeComparer,
    orderByAttributeComparer,
    setCombatOrder
};