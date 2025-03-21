const Logger = require("../logger");

const commands = {
    buscaitem: require("../commands/items/queryItemCommand"),
    bestiario: require("../commands/monsters/queryMonsterCommand"),
    drop: require("../commands/combat/getDropsCommand"),
    dropar: require("../commands/combat/getDropsUniqueCommand"),
    additem: require("../commands/items/addItemToInventoryCommand")
};

module.exports = {
    handleAsync: async (interaction) => {
        Logger.debug(`Processing autocomplete ${interaction.id}: ${interaction.commandName}`);
        const command = commands[interaction.commandName];
        if (!command) {
            Logger.warn(`Command ${interaction.commandName} autocomplete is not registered`);
            return;
        }
        await commands[interaction.commandName].autocomplete(interaction);
    }
}