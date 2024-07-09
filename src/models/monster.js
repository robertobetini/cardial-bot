const MonsterDrop = require("./monsterDrop");

class Monster {
    constructor(id, name, description, level, quantity, hp, ca, hits, vulnerability, resistance, immunity, baseGold = 0, baseExp = 0, drops = []) {
        this.id = id;
        this.name = name;
        this.queryName = name.toUpperCase();
        this.description = description;
        this.level = level,
        this.quantity = quantity,
        this.HP = hp,
        this.CA = ca,
        this.hits = hits,
        this.vulnerability = vulnerability,
        this.resistance = resistance,
        this.immunity = immunity,
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
            monsterDTO.MONSTERS.description, 
            monsterDTO.MONSTERS.level, 
            monsterDTO.MONSTERS.quantity, 
            monsterDTO.MONSTERS.HP, 
            monsterDTO.MONSTERS.CA, 
            monsterDTO.MONSTERS.hits, 
            monsterDTO.MONSTERS.vulnerability, 
            monsterDTO.MONSTERS.resistance, 
            monsterDTO.MONSTERS.immunity, 
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
