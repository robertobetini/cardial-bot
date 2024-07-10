class DiceService {
    static roll({ times = 1, dice = 20, mod = 0 }) {
        const rolls = { times, dice, mod, results: [] };

        for (let i = 0; i < times; i++) {
            const result = Math.floor(Math.random() * dice + 1) + mod;
            rolls.results.push(result);
        }

        rolls.total = rolls.results.reduce((val, total) => total += val, 0);
        return rolls;
    }
    
    static parseDiceString(diceString) {
        const number = Number(diceString);
        if (!isNaN(number)) {
            return { times: 1, dice: 0, mod: number };
        }

        const result = /^(\d+)d(\d+)(\+\d*|-\d*)?$/.exec(diceString);
        if (!result) {
            throw new Error("Invalid dice pattern");
        }

        const times = result[1];
        const dice = result[2];
        const mod = Number(result[3] ?? 0);

        return { times, dice, mod };
    }
}

module.exports = DiceService;
