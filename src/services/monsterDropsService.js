const monsterDropsDAO = require("../DAOs/monsterDropsDAO");

const DiceService = require("./diceService");

const Constants = require("../constants");

class MonsterDropsService {
    static get(monsterId) {
        return monsterDropsDAO.get(monsterId);
    }

    static batchUpsert(drops) {
        monsterDropsDAO.batchUpsert(drops);
    }

    static batchInsert(drops) {
        monsterDropsDAO.batchInsert(drops);
    }

    static deleteAll() {
        monsterDropsDAO.deleteAll();
    }

    static generateDrops(monsters) {
        const details = {};
        const summary = {};

        for (const monster of monsters) {
            details[monster.id] = details[monster.id] ?? []; 
            const dropResult = DiceService.roll({ dice: 100 });

            for (const drop of monster.drops) {
                if (dropResult.total > drop.diceMax || dropResult.total < drop.diceMin) {
                    continue;
                }
    
                const quantityDice = DiceService.parseDiceString(drop.quantity);
                const quantityResult = DiceService.roll(quantityDice);
                const loot = [];
                for (let i = 0; i < quantityResult.total; i++) {
                    summary[drop.item.name] = summary[drop.item.name] || 0;
                    drop.item.id === Constants.GOLD_ITEM_ID ? summary[drop.item.name] += drop.gold : summary[drop.item.name]++;
    
                    loot.push({
                        item: drop.item,
                        gold: drop.gold,
                        diceValue: dropResult.total
                    });
                }
                details[monster.id] = details[monster.id].concat(loot);
            }
        }

        return [details, summary];
    }
}

module.exports = MonsterDropsService;
