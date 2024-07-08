const Sqlite3DAO = require("./sqlite3DAO");

const MonsterDrop = require("../models/monsterDrop");

class MonsterDropDAO extends Sqlite3DAO {
    get(monsterId, fullDrops = true) {
        const db = this.getConnection();
        let query = "SELECT * FROM MONSTER_DROPS AS md ";
        if (fullDrops) {
            query += "LEFT JOIN ITEMS AS i ON i.id = md.itemId ";
        }
        query += "WHERE monsterId = ?";
        const drops = db.prepare(query).expand().all(monsterId);
        
        return drops.map(drop => MonsterDrop.fromDTO(drop));
    }

    insert(drop) {
        const db = this.getConnection();
        const query = "INSERT INTO MONSTER_DROPS (monsterId, itemId, quantity, gold, DICE_MIN, DICE_MAX) VALUES (?,?,?,?,?,?)";
        db.prepare(query).run(drop.monsterId, drop.itemId, drop.quantity, drop.gold, drop.diceMin, drop.diceMax);
    }

    update(drop) {
        const db = this.getConnection();
        const query = "UPDATE MONSTER_DROPS SET itemId = ?, quantity = ?, DICE_MIN = ?, DICE_MAX = ? WHERE monsterId = ?";
        const res = db.prepare(query).run(drop.itemId, drop.quantity, drop.diceMin, drop.diceMax, drop.monsterId);

        return res.changes.valueOf() > 0;
    }

    upsert(drop) {
        const updated = this.update(drop);

        if (!updated) {
            this.insert(drop);
        }
    }

    batchUpsert(drops) {
        const db = this.getConnection();
        const execute = db.transaction((drops) => drops.map(drop => this.upsert(drop)));
        execute(drops);
    }

    batchInsert(drops) {
        const db = this.getConnection();
        const execute = db.transaction((drops) => drops.map(drop => this.insert(drop)));
        execute(drops);
    }

    deleteAll() {
        const db = this.getConnection();
        const query = "DELETE FROM MONSTER_DROPS";
        db.prepare(query).run();
    }
}

module.exports = new MonsterDropDAO();
