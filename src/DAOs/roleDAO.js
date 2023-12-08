const MySQLDAO = require("./mySQLDAO");
const Role = require("../models/role");

class RoleDAO extends MySQLDAO {
    async getAll() {
        const conn = await this.getConnection();
        const query = "SELECT * FROM ROLES";
        const res = await conn.execute(query);

        if (res[0].length === 0) {
            return null;
        }

        const roles = [];
        for (let item of res[0]) {
            const role = Role.fromDTO(item);
            roles.push(role);
        }

        return roles; 
    }

    async get(guildId, type) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM ROLES WHERE guildId = ? AND `type` = ?";
        const res = await conn.execute(query, [ guildId, type ]);

        if (res[0].length === 0) {
            return null;
        }

        return Role.fromDTO(res[0][0]);
    }

    async insert(role) {
        const conn = await this.getConnection();
        const query = "INSERT INTO ROLES (guildId, roleId, `type`) VALUES (?, ?, ?)";
        const _res =  await conn.execute(query, [ role.guildId, role.roleId, role.type ]);
    }

    async update(role) {
        const conn = await this.getConnection();
        const query = "UPDATE ROLES SET roleId = ? WHERE guildId = ? AND `type` = ?";
        const res =  await conn.execute(query, [ role.roleId, role.guildId, role.type ]);

        return res[0].affectedRows > 0;
    }

    async upsert(role) {
        const updated = await this.update(role);

        if (!updated) {
            await this.insert(role);
        }
    }
}

module.exports = new RoleDAO();
