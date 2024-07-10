const monsterDAO = require("../DAOs/monsterDAO");

class MonsterService {
    static get(monsterId, fullMonster = true) {
        return monsterDAO.get(monsterId, fullMonster);
    }

    static getAll(fullMonster = true) {
        return monsterDAO.getAll(fullMonster);
    }

    static like(name, limit = 25) {
        return monsterDAO.like(name, limit);
    }

    static batchUpsert(monsters) {
        monsterDAO.batchUpsert(monsters);
    }

    static batchInsert(monsters) {
        monsterDAO.batchInsert(monsters);
    }

    static batchUpdate(monsters) {
        monsterDAO.batchUpdate(monsters);
    }

    static deleteAll() {
        monsterDAO.deleteAll();
    }
}

module.exports = MonsterService;
