const Sqlite3DAO = require("./sqlite3DAO");

const InventoryItem = require("../models/inventoryItem");

class InventoryDAO extends Sqlite3DAO {
    get(userId, guildId, itemId) {
        const db = this.getConnection();
        const query = "SELECT * FROM PLAYER_INVENTORY WHERE userId = ? AND guildId = ? AND itemId = ?";
        return db.prepare(query).get(userId, guildId, itemId);
    }

    getFullInventory(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM PLAYER_INVENTORY AS pi LEFT JOIN ITEMS as i ON i.id = pi.itemId WHERE pi.userId = ? AND pi.guildId = ?";
        const inventoryItems = db.prepare(query).expand().all(userId, guildId);

        return inventoryItems.map(ii => InventoryItem.fromDTO(ii));
    }

    insert(userId, guildId, itemId, count, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "INSERT INTO PLAYER_INVENTORY (userId, guildId, itemId, count) VALUES (?, ?, ?, ?)";
        db.prepare(query).run(userId, guildId, itemId, count);
    }

    update(userId, guildId, itemId, count, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "UPDATE PLAYER_INVENTORY SET count = ? WHERE userId = ? AND guildId = ? AND itemId = ?";
        const res = db.prepare(query).run(count, userId, guildId, itemId);

        return res.changes.valueOf() > 0;
    }

    upsert(userId, guildId, itemId, count, transactionDb = null) {
        const updated = this.update(userId, guildId, itemId, count, transactionDb);

        if (!updated) {
            this.insert(userId, guildId, itemId, count, transactionDb);
        }
    }
}

module.exports = new InventoryDAO();
