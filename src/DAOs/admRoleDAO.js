const MySQLDAO = require("./mySQLDAO");
const AdmRole = require("../models/admRole");

class AdmRoleDAO extends MySQLDAO {
    async get(guildId) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM ADM_ROLES WHERE guildId = ?";
        const res = await conn.execute(query, [ guildId ]);

        if (res[0].length === 0) {
            return null;
        }

        return AdmRole.fromDTO(res[0][0]);
    }

    async insert(admRole) {
        const conn = await this.getConnection();
        const query = "INSERT INTO ADM_ROLES (guildId, roleId) VALUES (?, ?)";
        const _res =  await conn.execute(query, [ admRole.guildId, admRole.roleId ]);
    }

    async update(admRole) {
        const conn = await this.getConnection();
        const query = "UPDATE ADM_ROLES SET roleId = ? WHERE guildId = ?";
        const res =  await conn.execute(query, [ admRole.roleId, admRole.guildId ]);

        return res[0].affectedRows > 0;
    }

    async upsert(admRole) {
        const updated = await this.update(admRole);

        if (!updated) {
            await this.insert(admRole);
        }
    }
}

module.exports = new AdmRoleDAO();
