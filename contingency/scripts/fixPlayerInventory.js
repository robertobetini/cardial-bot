const inventoryDAO = require("../../src/DAOs/inventoryDAO");

const iis =[
    // [ userId, guildId, itemId, countToAdd ]
];

module.exports = {
    execute: () => {
        for (const ii of iis) {
            const [userId, guildId, itemId, count] = ii;
            const existingII = inventoryDAO.get(userId, guildId, itemId);
            const existingCount = existingII?.count || 0;
        
            inventoryDAO.upsert(userId, guildId, itemId, count + existingCount);
        }
    }
}
