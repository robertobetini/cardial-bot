const monsterDropsDAO = require("../DAOs/monsterDropsDAO");

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
}

module.exports = MonsterDropsService;
