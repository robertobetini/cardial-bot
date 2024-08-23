const itemsDAO = require("../DAOs/itemsDAO");

const Constants = require("../constants");

class ItemService {
    static get(itemId) {
        return itemsDAO.get(itemId);
    }

    static getGoldItem() {
        return itemsDAO.get(Constants.GOLD_ITEM_ID);
    }

    static getItemTypes() {
        return itemsDAO.getItemTypes();
    }

    static like(name, limit = 25, includeGold = false, itemType = null) {
        return itemsDAO.like(name, limit, includeGold, itemType);
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
