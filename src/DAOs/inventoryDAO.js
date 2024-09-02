const Sqlite3DAO = require("./sqlite3DAO");

const InventoryItem = require("../models/inventoryItem");
const Inventory = require("../models/inventory");

class InventoryDAO extends Sqlite3DAO {
    get(userId, guildId, itemId) {
        const db = this.getConnection();
        const query = "SELECT * FROM PLAYER_INVENTORY WHERE userId = ? AND guildId = ? AND itemId = ?";
        return db.prepare(query).get(userId, guildId, itemId);
    }

    getFullInventory(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM PLAYER_INVENTORY AS pi " + 
            "LEFT JOIN ITEMS AS i ON i.id = pi.itemId " + 
            "LEFT JOIN STATS AS s ON s.userId = pi.userId AND s.guildId = pi.guildId " +
            "WHERE pi.userId = ? AND pi.guildId = ?";
        const inventoryItems = db.prepare(query).expand().all(userId, guildId);

        const inventoryItemsDTOs = inventoryItems.map(ii => InventoryItem.fromDTO(ii));
        
        return new Inventory(userId, guildId, inventoryItemsDTOs, inventoryItems[0]?.STATS?.extraSlots);
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

    upsertFullInventory(inventory) {
        inventory.items.forEach(ii => {
            if (ii.count < 1) {
                this.deleteOne(inventory.userId, inventory.guildId, ii.item.id);
                return;
            }
            this.upsert(inventory.userId, inventory.guildId, ii.item.id, ii.count);
        });
    }

    clear(userId, guildId) {
        const db = this.getConnection();
        const query = "DELETE FROM PLAYER_INVENTORY WHERE userId = ? AND guildId = ?";
        db.prepare(query).run(userId, guildId);
    }

    deleteOne(userId, guildId, itemId) {
        const db = this.getConnection();
        const query = "DELETE FROM PLAYER_INVENTORY WHERE userId = ? AND guildId = ? AND itemId = ?";
        db.prepare(query).run(userId, guildId, itemId);
    }

    deleteAll() {
        const db = this.getConnection();
        const query = "DELETE FROM PLAYER_INVENTORY";
        db.prepare(query).run();
    }

    applyBackup(bkpName, itemIds) {
        this.applyTableBackup(bkpName, "PLAYER_INVENTORY", `WHERE itemId IN (${itemIds.join(",")})`);
    }
}

module.exports = new InventoryDAO();
