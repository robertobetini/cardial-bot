const skillsDAO = require("../DAOs/skillsDAO");
const Skills = require("../models/skills");

class SkillsService {
    static get(userId, guildId) {
        return skillsDAO.get(userId, guildId);
    }
    
    static updateSingleSkill(userId, guildId, skill, newValue) {
        const result = skillsDAO.updateSingleSkill(userId, guildId, skill, newValue);
        if (result > 0) {
            return result;
        }

        const skills = new Skills(userId, guildId);
        skillsDAO.upsert(userId, guildId, skills);
        return skillsDAO.updateSingleSkill(userId, guildId, skill, newValue);
    }
}

module.exports = SkillsService;
