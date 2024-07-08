const Item = require("./item");

class MonsterDrop {
    constructor(monsterId, itemId, quantity, gold, diceMin, diceMax, item = {}) {
        this.monsterId = monsterId;
        this.itemId = itemId;
        this.quantity = quantity;
        this.gold = gold;
        this.diceMin = diceMin;
        this.diceMax = diceMax;
        this.item = item;
    }

    static fromDTO(monsterDropDTO) {
        if (!monsterDropDTO || !monsterDropDTO.MONSTER_DROPS) {
            return null;
        }

        return new MonsterDrop(
            monsterDropDTO.MONSTER_DROPS.monsterId, 
            monsterDropDTO.MONSTER_DROPS.itemId, 
            monsterDropDTO.MONSTER_DROPS.quantity,
            monsterDropDTO.MONSTER_DROPS.gold,
            monsterDropDTO.MONSTER_DROPS.DICE_MIN,
            monsterDropDTO.MONSTER_DROPS.DICE_MAX,
            Item.fromDTO(monsterDropDTO.ITEMS)
        );
    }
}

module.exports = MonsterDrop;
