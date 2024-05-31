const MySQLDAO = require("./mySQLDAO");
const statsDAO = require("./statsDAO");
const attributesDAO = require("./attributesDAO");
const skillsDAO = require("./skillsDAO");
const User = require("../models/user");

class UserDAO extends MySQLDAO {
    async getAllSilent() {
        const conn = await this.getConnection();
        const query = "SELECT * FROM USERS WHERE silenceEndTime > 0";
        const res = await conn.execute(query);

        const users = [];
        for (let userDTO of res[0]) {
            users.push(User.fromDTO(userDTO));
        }

        return users;
    }

    async getAllFromGuild(guildId, orderby, skip, limit, fullUser = true) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM USERS AS u WHERE guildId = " + guildId;

        if (fullUser) {
            query += " LEFT JOIN STATS as st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES as a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS as sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }

        query += " ORDER BY u." + orderby + " DESC"
            + " LIMIT " + limit.toString()
            + " OFFSET " + skip.toString();
        const res = await conn.execute(query);

        const users = [];
        for (let userDTO of res[0]) {
            users.push(User.fromDTO(userDTO));
        }

        return users;
    }

    async get(userId, guildId, fullUser = true) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM USERS as u WHERE userId = ? AND guildId = ?";
        if (fullUser) {
            query += " LEFT JOIN STATS as st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES as a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS as sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        return User.fromDTO(res[0][0]);
    }

    async insert(user, deepInsert = false) {
        const conn = await this.getConnection();
        const query = "INSERT INTO USERS (userId, guildId, user, silenceEndTime, playerName, job) VALUES (?, ?, ?, ?, ?, ?)";
        const _res =  await conn.execute(query, [ user.userId, user.guildId, user.username, user.silenceEndTime, user.playerName, user.job ]);

        if (deepInsert) {
            await statsDAO.insert(user.userId, user.guildId, user.stats);
            await attributesDAO.insert(user.userId, user.guildId, user.attributes);
            await skillsDAO.insert(user.userId, user.guildId, user.skills);
        }
    }

    async update(user, deepUpdate = false) {
        const conn = await this.getConnection();
        const query = "UPDATE USERS SET silenceEndTime = ?, playerName = ?, job = ? WHERE userId = ? and guildId = ?";
        const res =  await conn.execute(query, [ user.silenceEndTime, user.playerName, user.job, user.userId, user.guildId ]);

        if (deepUpdate) {
            await statsDAO.update(user.userId, user.guildId, user.stats);
            await attributesDAO.update(user.userId, user.guildId, user.attributes);
            await skillsDAO.update(user.userId, user.guildId, user.skills);
        }

        return res[0].affectedRows > 0;
    }

    async upsert(user, deepUpsert = false) {
        const updated = await this.update(user, deepUpsert);

        if (!updated) {
            await this.insert(user, deepUpsert);
        }
    }

    async batchUpsert(users, deepUpsert = false) {
        const conn = await this.getConnection();
        await conn.beginTransaction();

        try {
            for (let user of users) {
                this.upsert(user, deepUpsert);
            }

            conn.commit();
        } catch(err) {
            conn.rollback()
        }
    }

    async clearGoldFromAll(guildId) {
        const conn = await this.getConnection();
        const query = "UPDATE USERS SET gold = 0 WHERE guildId = ?";
        const _res =  await conn.execute(query, [guildId]);
    }
}

module.exports = new UserDAO();
