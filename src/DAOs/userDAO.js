const mysql = require('mysql2/promise');
const User = require("../models/user");

class UserDAO {
    connection = null;

    async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '123456',
            database : 'DISCORD_USERS_DB'
        });

        return this.connection;
    }

    async getAll(guildId, orderby) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM USERS WHERE guildId = ? ORDER BY ? DESC LIMIT 50";
        const res = await conn.execute(query, [ guildId, orderby ]);

        const users = [];
        for (let userDTO of res[0]) {
            users.push(User.fromDTO(userDTO));
        }

        return users;
    }

    async get(userId, guildId) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM USERS WHERE userId = ? and guildId = ?";
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        return User.fromDTO(res[0][0]);
    }

    async insert(user) {
        const conn = await this.getConnection();
        const query = "INSERT INTO USERS (userId, guildId, username, gold, totalExp) VALUES (?, ?, ?, ?, ?)";
        const _res =  await conn.execute(query, [ user.userId, user.guildId, user.username, user.gold, user.totalExp, ]);
    }

    async update(user) {
        const conn = await this.getConnection();
        const query = "UPDATE USERS SET gold = ?, totalExp = ? WHERE userId = ? and guildId = ?";
        const res =  await conn.execute(query, [ user.gold, user.totalExp, user.userId, user.guildId ]);

        return res[0].affectedRows > 0;
    }

    async upsert(user) {
        const updated = await this.update(user);

        if (!updated) {
            await this.insert(user);
        }
    }

    async batchUpsert(users) {
        const conn = await this.getConnection();
        await conn.beginTransaction();

        try {
            for (let user of users) {
                const updated = await this.update(user);
        
                if (!updated) {
                    await this.insert(user);
                }
            }

            conn.commit();
        } catch(err) {
            conn.rollback()
        }
    }
}

module.exports = new UserDAO();
