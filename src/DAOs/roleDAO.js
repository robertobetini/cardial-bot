const Sqlite3DAO = require("./sqlite3DAO");

const Role = require("../models/role");

class RoleDAO extends Sqlite3DAO {
    async getAll() {
        const db = this.getConnection();
        const query = "SELECT * FROM ROLES";
        const roles = db.prepare(query).all();

        return roles.map(r => Role.fromDTO(r)); 
    }

    async get(guildId, type) {
        const db = this.getConnection();
        const query = "SELECT * FROM ROLES WHERE guildId = ? AND `type` = ?";
        const role = db.prepare(query).get(guildId, type);

        return Role.fromDTO(role);
    }

    async insert(role) {
        const db = this.getConnection();
        const query = "INSERT INTO ROLES (guildId, roleId, type) VALUES (?, ?, ?)";
        db.prepare(query).run(role.guildId, role.roleId, role.type);
    }

    async update(role) {
        const db = this.getConnection();
        const query = "UPDATE ROLES SET roleId = ? WHERE guildId = ? AND type = ?";
        const res = db.prepare(query).run(role.roleId, role.guildId, role.type);

        return res.changes.valueOf() > 0;
    }

    async upsert(role) {
        const updated = await this.update(role);

        if (!updated) {
            await this.insert(role);
        }
    }
}

module.exports = new RoleDAO();
