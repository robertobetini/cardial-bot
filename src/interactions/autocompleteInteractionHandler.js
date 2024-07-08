const Logger = require("../logger");

const commands = {
    buscaitem: require("../commands/items/queryItemCommand"),
    buscamob: require("../commands/monsters/queryMonsterCommand"),
};

module.exports = {
    handleAsync: async (interaction) => {
        Logger.debug(`Processing autocomplete handler: ${interaction.commandName}`);
        await commands[interaction.commandName].autocomplete(interaction);
    }
}