const Sqlite3DAO = require("./sqlite3DAO");

const Skills = require("../models/skills");

class SkillsDAO extends Sqlite3DAO {
    async get(userId, guildId) {
        const db = this.getConnection();
        const query = "SELECT * FROM SKILLS WHERE userId = ? AND guildId = ?";
        const skills = db.prepare(query).get(userId, guildId);

        return Skills.fromDTO(skills);
    }

    async insert(userId, guildId, skills, transactionDb = null) {
        const db = transactionDb || this.getConnection();
        const query = "INSERT INTO SKILLS (userId, guildId, athletics, acrobatics, jugglery, stealth, animalTraining, intuition, investigation, nature, perception, survivability, deception, intimidation, performance, persuasion) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        db.prepare(query).run(
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
        );
    }

    async update(userId, guildId, skills, transactionDb = null) {
        const db = transactionDb || await this.getConnection();
        const query = "UPDATE SKILLS SET athletics = ?, acrobatics = ?, jugglery = ?, stealth = ?, animalTraining = ?, intuition = ?, investigation = ?, nature = ?, perception = ?, survivability = ?, deception = ?, intimidation = ?, performance = ?, persuasion = ?"
            + " WHERE userId = ? AND guildId = ?";

        const res = db.prepare(query).run(
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
        );

        return res.changes.valueOf() > 0;
    }

    async upsert(userId, guildId, skills, transactionDb = null) {
        const updated = await this.update(userId, guildId, skills, transactionDb);

        if (!updated) {
            await this.insert(userId, guildId, skills, transactionDb);
        }
    }

    async updateSingleSkill(userId, guildId, skill, value) {
        const db = this.getConnection();
        const query = "UPDATE SKILLS SET " + skill + " = ? WHERE userId = ? AND guildId = ?";
        const res = db.prepare(query).run(value, userId, guildId);

        return res.changes.valueOf() > 0;
    }
}

module.exports = new SkillsDAO();
