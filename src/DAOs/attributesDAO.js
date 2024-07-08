const Sqlite3DAO = require("./sqlite3DAO");

const Attributes = require("../models/attributes");

class AttributesDAO extends Sqlite3DAO {
    get(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM ATTRIBUTES WHERE userId = ? AND guildId = ?";
        const attributes = db.prepare(query).get(userId, guildId);

        return Attributes.fromDTO(attributes);
    }
    
    insert(userId, guildId, attributes, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "INSERT INTO ATTRIBUTES (userId, guildId, `FOR`, DEX, CON, WIS, CHA, availablePoints, firstAttributionDone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const firstAttributionDone = attributes.firstAttributionDone ? 1 : 0;
        db
            .prepare(query)
            .run(userId, guildId, attributes.STR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA, attributes.availablePoints, firstAttributionDone);
    }

    update(userId, guildId, attributes, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "UPDATE ATTRIBUTES SET `FOR` = ?, DEX = ?, CON = ?, WIS = ?, CHA = ?, availablePoints = ?, firstAttributionDone = ? WHERE userId = ? AND guildId = ?";
        const firstAttributionDone = attributes.firstAttributionDone ? 1 : 0;
        const res = db
            .prepare(query)
            .run(attributes.STR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA, attributes.availablePoints, firstAttributionDone, userId, guildId);

        return res.changes.valueOf() > 0;
    }

    upsert(userId, guildId, attributes, transactionDb = null) {
        const updated = this.update(userId, guildId, attributes, transactionDb);

        if (!updated) {
            this.insert(userId, guildId, attributes, transactionDb);
        }
    }
}

module.exports = new AttributesDAO();
