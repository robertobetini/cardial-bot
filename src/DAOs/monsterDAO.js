const Sqlite3DAO = require("./sqlite3DAO");

const monsterDropsDAO = require("./monsterDropsDAO");

const Monster = require("../models/monster");

class MonsterDAO extends Sqlite3DAO {
    get(id, fullMonster = true) {
        const db = this.getConnection();
        const query = "SELECT * FROM MONSTERS AS m WHERE m.id = ?";
        const monster = db.prepare(query).expand().get(id);
        
        const dto = Monster.fromDTO(monster);
        if (fullMonster) {
            dto.drops = monsterDropsDAO.get(id);
        }

        return dto;
    }

    like(name, limit = 25) {
        const db = this.getConnection();
        const query = "SELECT rowid, * FROM MONSTERS WHERE queryName LIKE ? LIMIT " + limit.toString();
        const monsters = db.prepare(query).expand().all("%" + name.toUpperCase() + "%");

        return monsters.map(monster => Monster.fromDTO(monster));
    }

    insert(monster) {
        const db = this.getConnection();
        const query = "INSERT INTO MONSTERS (id, name, queryName, description, level, quantity, HP, CA, hits, vulnerability, resistance, immunity, baseGold, baseExp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        db.prepare(query).run(
            monster.id, monster.name, monster.queryName.toUpperCase(), monster.description, monster.level, monster.quantity, 
            monster.HP, monster.CA, monster.hits, monster.vulnerability, monster.resistance, monster.immunity, monster.baseGold, monster.baseExp);
    }

    update(monster) {
        const db = this.getConnection();
        const query = "UPDATE MONSTERS SET baseGold = ?, baseExp = ? WHERE id = ?";
        const res = db.prepare(query).run(monster.baseGold, monster.baseExp, monster.id);

        return res.changes.valueOf() > 0;
    }

    upsert(monster) {
        const updated = this.update(monster);

        if (!updated) {
            this.insert(monster);
        }
    }

    batchUpsert(monsters) {
        const db = this.getConnection();
        const execute = db.transaction((monsters) => monsters.map(monster => this.upsert(monster)));
        execute(monsters);
    }

    batchInsert(monsters) {
        const db = this.getConnection();
        const execute = db.transaction((monsters) => monsters.map(monster => this.insert(monster)));
        execute(monsters);
    }

    batchUpdate(monsters) {
        const db = this.getConnection();
        const execute = db.transaction((monsters) => monsters.map(monster => this.update(monster)));
        execute(monsters);
    }

    deleteAll() {
        const db = this.getConnection();
        const query = "DELETE FROM MONSTERS";
        db.prepare(query).run();
    }
}

module.exports = new MonsterDAO();
