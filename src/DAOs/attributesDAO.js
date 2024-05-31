const MySQLDAO = require("./mySQLDAO");

class AttributesDAO extends MySQLDAO {
    async insert(userId, guildId, attributes) {
        const conn = await this.getConnection();
        const query = "INSERT INTO ATTRIBUTES (userId, guildId, `FOR`, DEX, CON, WIS, CHA) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const _res = await conn.execute(query, [userId, guildId, attributes.FOR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA]);
    }

    async update(userId, guildId, attributes) {
        const conn = await this.getConnection();
        const query = "UPDATE ATTRIBUTES SET `FOR` = ?, DEX = ?, CON = ?, WIS = ?, CHA = ? WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [attributes.FOR, attributes.DEX, attributes.CON, attributes.WIS, attributes.CHA, userId, guildId]);

        return res[0].affectedRows > 0;
    }
}

module.exports = new AttributesDAO();
