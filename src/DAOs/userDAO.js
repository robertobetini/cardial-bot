const Sqlite3DAO = require("./sqlite3DAO");
const statsDAO = require("./statsDAO");
const attributesDAO = require("./attributesDAO");
const skillsDAO = require("./skillsDAO");
const User = require("../models/user");

class UserDAO extends Sqlite3DAO {
    getAllSilent() {
        const db = this.getConnection();
        const query = "SELECT * FROM USERS WHERE silenceEndTime > 0";
        const users = db.prepare(query).all();

        return users.map(u => User.fromDTO(u));
    }

    getAllFromGuild(guildId, orderby, skip, limit, fullUser = true) {
        const db = this.getConnection();

        let query = "SELECT * FROM USERS AS u";
        if (fullUser) {
            query += " LEFT JOIN STATS as st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES as a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS as sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }

        query += " WHERE u.guildId = " + guildId;
        if (orderby) {
            query += " ORDER BY st." + orderby + " DESC";
        }
        if (limit) {
            query += " LIMIT " + limit.toString();
        }
        if (skip) {
            query += " OFFSET " + skip.toString();
        }

        const users = db.prepare(query).all();

        return users.map(u => User.fromDTO(u));
    }

    get(userId, guildId, fullUser = true) {
        const db = this.getConnection();

        let query = "SELECT * FROM USERS AS u";
        if (fullUser) {
            query += " LEFT JOIN STATS AS st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES AS a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS AS sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }
        query += " WHERE u.userId = ? AND u.guildId = ?";
        const user = db.prepare(query).get(userId, guildId);

        return User.fromDTO(user);
    }

    insert(user, deepInsert = false) {
        const db = this.getConnection();
        const query = "INSERT INTO USERS (userId, guildId, user, silenceEndTime, playerName, job, imgUrl) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        const execute = db.transaction((user) => {
            db.prepare(query).run(user.userId, user.guildId, user.username, user.silenceEndTime, user.playerName, user.job, user.imgUrl);
    
            if (deepInsert) {
                statsDAO.insert(user.userId, user.guildId, user.stats, db);
                attributesDAO.insert(user.userId, user.guildId, user.attributes, db);
                skillsDAO.insert(user.userId, user.guildId, user.skills, db);
            }
        });

        execute(user);
    }

    update(user, deepUpdate = false) {
        const db = this.getConnection();
        const query = "UPDATE USERS SET silenceEndTime = ?, playerName = ?, job = ?, notes = ?, imgUrl = ? " 
            + "WHERE userId = ? and guildId = ?";

        const execute = db.transaction(user => {
            const res = db.prepare(query).run(user.silenceEndTime, user.playerName, user.job, user.notes, user.imgUrl, user.userId, user.guildId);
    
            if (deepUpdate) {
                statsDAO.update(user.userId, user.guildId, user.stats, db);
                attributesDAO.update(user.userId, user.guildId, user.attributes, db);
                skillsDAO.update(user.userId, user.guildId, user.skills, db);
            }

            return res.changes.valueOf() > 0;
        });

        return execute(user);
    }

    upsert(user, deepUpsert = false) {
        const updated = this.update(user, deepUpsert);

        if (!updated) {
            this.insert(user, deepUpsert);
        }
    }

    batchUpsert(users, deepUpsert = false) {
        const db = this.getConnection();
        const execute = db.transaction((users) => users.map(u => this.upsert(u, deepUpsert)));
        execute(users);
    }

    clearGoldFromAll(guildId) {
        const db = this.getConnection();
        const query = "UPDATE USERS SET gold = 0 WHERE guildId = ?";
        db.prepare(query).run(guildId);
    }
}

module.exports = new UserDAO();
