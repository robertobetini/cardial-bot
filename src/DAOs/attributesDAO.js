const MySQLDAO = require("./mySQLDAO");

const Attributes = require("../models/attributes");

class AttributesDAO extends MySQLDAO {
    async get(userId, guildId) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM ATTRIBUTES WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        return Attributes.fromDTO(res[0][0]);
    }
    async insert(userId, guildId, attributes, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "INSERT INTO ATTRIBUTES (userId, guildId, `FOR`, DEX, CON, WIS, CHA, availablePoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const _res = await conn.execute(query, [userId, guildId, attributes.FOR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA, attributes.availablePoints]);
    }

    async update(userId, guildId, attributes, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "UPDATE ATTRIBUTES SET `FOR` = ?, DEX = ?, CON = ?, WIS = ?, CHA = ? WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [attributes.FOR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA, userId, guildId]);

        return res[0].affectedRows > 0;
    }

    async upsert(userId, guildId, attributes, transactionConn = null) {
        const updated = await this.update(userId, guildId, attributes, transactionConn);

        if (!updated) {
            await this.insert(userId, guildId, attributes, transactionConn);
        }
    }
}

module.exports = new AttributesDAO();
