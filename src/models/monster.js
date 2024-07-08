const MonsterDrop = require("./monsterDrop");

class Monster {
    constructor(id, name, baseGold, baseExp, drops = []) {
        this.id = id;
        this.name = name;
        this.queryName = name.toUpperCase();
        this.baseGold = baseGold;
        this.baseExp = baseExp;
        this.drops = drops;
    }

    static fromDTO(monsterDTO, fullMonster) {
        if (!monsterDTO || !monsterDTO.MONSTERS) {
            return null;
        }

        const monster = new Monster(
            monsterDTO.MONSTERS.id, 
            monsterDTO.MONSTERS.name, 
            monsterDTO.MONSTERS.baseGold, 
            monsterDTO.MONSTERS.baseExp
        );

        if (fullMonster) {
            monster.drops.push(MonsterDrop.fromDTO(monsterDTO));
        }

        return monster;
    }
}

module.exports = Monster;
