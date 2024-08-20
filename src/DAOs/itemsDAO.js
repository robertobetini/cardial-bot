const Sqlite3DAO = require("./sqlite3DAO");

const Item = require("../models/item");

class ItemsDAO extends Sqlite3DAO {
    get(itemId) {
        const db = this.getConnection();
        const query = "SELECT rowid, * FROM ITEMS WHERE id = ?";
        const item = db.prepare(query).get(itemId);
        
        return Item.fromDTO(item);
    }

    like(name, limit = 25, includeGold = false) {
        const db = this.getConnection();
        let query = "SELECT rowid, * FROM ITEMS WHERE "
        if (!includeGold) {
            query += "queryName != 'GOLD' AND "
        }
        query += "queryName LIKE ? LIMIT " + limit.toString();
        const items = db.prepare(query).all("%" + name.toUpperCase() + "%");

        return items.map(item => Item.fromDTO(item));
    }

    insert(item) {
        const db = this.getConnection();
        const query = "INSERT INTO ITEMS (id, name, queryName, level, type, description, price, tier, weight, imgUrl, emoji, creator, details) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        db.prepare(query).run(item.id, item.name, item.queryName, item.level, item.type, item.description, item.price, item.tier, item.weight, item.imgUrl, item.emoji, item.creator, item.details);
    }

    update(item) {
        const db = this.getConnection();
        const query = "UPDATE ITEMS SET name = ?, queryName = ?, level = ?, type = ?, description = ?, price = ?, tier = ?, weight = ?, imgUrl = ?, emoji = ?, creator = ?, details = ? WHERE id = ?";
        const res = db.prepare(query).run(item.name, item.queryName, item.level, item.type, item.description, item.price, item.tier, item.weight, item.imgUrl, item.emoji, item.creator, item.details, item.id);

        return res.changes.valueOf() > 0;
    }

    upsert(item) {
        const updated = this.update(item);

        if (!updated) {
            this.insert(item);
        }
    }

    batchUpsert(items) {
        const db = this.getConnection();
        const execute = db.transaction((items) => items.map(item => this.upsert(item)));
        execute(items);
    }

    batchInsert(items) {
        const db = this.getConnection();
        const execute = db.transaction((items) => items.map(item => this.insert(item)));
        execute(items);
    }

    deleteAll() {
        const db = this.getConnection();
        const query = "DELETE FROM ITEMS";
        db.prepare(query).run();
    }
}

module.exports = new ItemsDAO();