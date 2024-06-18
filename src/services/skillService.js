const skillsDAO = require("../DAOs/skillsDAO");

class SkillsService {
    static async get(userId, guildId) {
        return await skillsDAO.get(userId, guildId);
    }
    
    static async updateSingleSkill(userId, guildId, skill, newValue) {
        return await skillsDAO.updateSingleSkill(userId, guildId, skill, newValue);
    }
}

module.exports = SkillsService;
