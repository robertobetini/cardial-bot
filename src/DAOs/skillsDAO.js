const MySQLDAO = require("./mySQLDAO");

const Skills = require("../models/skills");

class SkillsDAO extends MySQLDAO {
    async get(userId, guildId) {
        const conn = await this.getConnection();
        const query = "SELECT * FROM SKILLS WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [userId, guildId]);

        if (res[0].length === 0) {
            return null;
        }

        return Skills.fromDTO(res[0][0]);
    }

    async insert(userId, guildId, skills, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "INSERT INTO SKILLS (userId, guildId, athletics, acrobatics, jugglery, stealth, animalTraining, intuition, investigation, nature, perception, survivability, deception, intimidation, performance, persuasion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        const _res = await conn.execute(query, [
            userId, guildId, 
            skills.athletics, 
            skills.acrobatics, 
            skills.jugglery, 
            skills.stealth, 
            skills.animalTraining, 
            skills.intuition, 
            skills.investigation, 
            skills.nature, 
            skills.perception, 
            skills.survivability, 
            skills.deception, 
            skills.intimidation, 
            skills.performance, 
            skills.persuasion
        ]);
    }

    async update(userId, guildId, skills, transactionConn = null) {
        const conn = transactionConn || await this.getConnection();
        const query = "UPDATE SKILLS SET athletics = ?, acrobatics = ?, jugglery = ?, stealth = ?, animalTraining = ?, intuition = ?, investigation = ?, nature = ?, perception = ?, survivability = ?, deception = ?, intimidation = ?, performance = ?, persuasion = ?"
            + " WHERE userId = ? AND guildId = ?";

        const res = await conn.execute(query, [
            skills.athletics, 
            skills.acrobatics, 
            skills.jugglery, 
            skills.stealth, 
            skills.animalTraining, 
            skills.intuition, 
            skills.investigation, 
            skills.nature, 
            skills.perception, 
            skills.survivability, 
            skills.deception, 
            skills.intimidation, 
            skills.performance, 
            skills.persuasion, 
            userId, guildId
        ]);

        return res[0].affectedRows > 0;
    }

    async upsert(userId, guildId, skills, transactionConn = null) {
        const updated = await this.update(userId, guildId, skills, transactionConn);

        if (!updated) {
            await this.insert(userId, guildId, skills, transactionConn);
        }
    }

    async updateSingleSkill(userId, guildId, skill, value) {
        const conn = await this.getConnection();
        const query = "UPDATE SKILLS SET " + skill + " = ? WHERE userId = ? AND guildId = ?";
        const res = await conn.execute(query, [value, userId, guildId]);

        return res[0].affectedRows > 0;
    }
}

module.exports = new SkillsDAO();
