const skillsDAO = require("../DAOs/skillsDAO");

class SkillsService {
    static get(userId, guildId) {
        return skillsDAO.get(userId, guildId);
    }
    
    static updateSingleSkill(userId, guildId, skill, newValue) {
        return skillsDAO.updateSingleSkill(userId, guildId, skill, newValue);
    }
}

module.exports = SkillsService;
