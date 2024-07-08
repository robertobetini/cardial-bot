const itemsDAO = require("../DAOs/itemsDAO");

class ItemService {
    static get(itemId) {
        return itemsDAO.get(itemId);
    }

    static like(name, limit = 25, includeGold = false) {
        return itemsDAO.like(name, limit, includeGold);
    }

    static batchUpsert(items) {
        itemsDAO.batchUpsert(items);
    }

    static batchInsert(items) {
        itemsDAO.batchInsert(items);
    }

    static deleteAll() {
        itemsDAO.deleteAll();
    }
}

module.exports = ItemService;
