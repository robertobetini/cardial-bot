const attributesDAO = require("../DAOs/attributesDAO");

class AttributesService {
    static async get(guildId, userId) {
        return await attributesDAO.get(userId, guildId);
    }

    static async update(attributes) {
        return await attributesDAO.update(attributes.userId, attributes.guildId, attributes);
    }
}

module.exports = AttributesService;
