const itemsDAO = require("../DAOs/itemsDAO");

class ItemService {
    static get(itemId) {
        return itemsDAO.get(itemId);
    }

    static like(name, limit = 25) {
        return itemsDAO.like(name, limit);
    }

    static batchUpsert(items) {
        itemsDAO.batchUpsert(items);
    }
}

module.exports = ItemService;
