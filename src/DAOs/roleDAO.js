const Sqlite3DAO = require("./sqlite3DAO");

const Role = require("../models/role");

class RoleDAO extends Sqlite3DAO {
    getAll() {
        const db = this.getConnection();
        const query = "SELECT * FROM ROLES";
        const roles = db.prepare(query).all();

        return roles.map(r => Role.fromDTO(r)); 
    }

    get(guildId, type) {
        const db = this.getConnection();
        const query = "SELECT * FROM ROLES WHERE guildId = ? AND `type` = ?";
        const role = db.prepare(query).get(guildId, type);

        return Role.fromDTO(role);
    }

    insert(role) {
        const db = this.getConnection();
        const query = "INSERT INTO ROLES (guildId, roleId, type) VALUES (?, ?, ?)";
        db.prepare(query).run(role.guildId, role.roleId, role.type);
    }

    update(role) {
        const db = this.getConnection();
        const query = "UPDATE ROLES SET roleId = ? WHERE guildId = ? AND type = ?";
        const res = db.prepare(query).run(role.roleId, role.guildId, role.type);

        return res.changes.valueOf() > 0;
    }

    upsert(role) {
        const updated = this.update(role);

        if (!updated) {
            this.insert(role);
        }
    }
}

module.exports = new RoleDAO();
