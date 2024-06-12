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
        let query = "SELECT * FROM USERS AS u";

        if (fullUser) {
            query += " LEFT JOIN STATS as st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES as a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS as sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }
        query += " WHERE u.guildId = " + guildId;

        query += " ORDER BY st." + orderby + " DESC"
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
        let query = "SELECT * FROM USERS AS u";
        if (fullUser) {
            query += " LEFT JOIN STATS AS st ON u.userId = st.userId AND u.guildId = st.guildId"
            + " LEFT JOIN ATTRIBUTES AS a ON u.userId = a.userId AND u.guildId = a.guildId"
            + " LEFT JOIN SKILLS AS sk ON u.userId = sk.userId AND u.guildId = sk.guildId";
        }
        query += " WHERE u.userId = ? AND u.guildId = ?";
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        res[0][0].userId = userId;
        res[0][0].guildId = guildId;

        return User.fromDTO(res[0][0]);
    }

    async insert(user, deepInsert = false) {
        const conn = await this.getConnection();
        await conn.beginTransaction();

        try {
            const query = "INSERT INTO USERS (userId, guildId, user, silenceEndTime, playerName, job, imgUrl) VALUES (?, ?, ?, ?, ?, ?, ?)";
            const _res =  await conn.execute(query, [ user.userId, user.guildId, user.username, user.silenceEndTime, user.playerName, user.job, user.imgUrl ]);
    
            if (deepInsert) {
                await statsDAO.insert(user.userId, user.guildId, user.stats, conn);
                await attributesDAO.insert(user.userId, user.guildId, user.attributes, conn);
                await skillsDAO.insert(user.userId, user.guildId, user.skills, conn);
            }

            conn.commit();
        } catch(err) {
            conn.rollback();
            throw err;
        }
    }

    async update(user, deepUpdate = false) {
        const conn = await this.getConnection();
        await conn.beginTransaction();

        try {
            const query = "UPDATE USERS SET silenceEndTime = ?, playerName = ?, job = ?, notes = ?, imgUrl = ? WHERE userId = ? and guildId = ?";
            const res =  await conn.execute(query, [ user.silenceEndTime, user.playerName, user.job, user.notes, user.imgUrl, user.userId, user.guildId ]);
    
            if (deepUpdate) {
                await statsDAO.update(user.userId, user.guildId, user.stats, conn);
                await attributesDAO.update(user.userId, user.guildId, user.attributes, conn);
                await skillsDAO.update(user.userId, user.guildId, user.skills, conn);
            }
    
            conn.commit();
            return res[0].affectedRows > 0;
        } catch(err) {
            conn.rollback();
            throw err;
        }
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

        //TODO: refatorar pra usar promise.all
        try {
            for (let user of users) {
                await this.upsert(user, deepUpsert);
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
