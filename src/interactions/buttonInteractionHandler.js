const Logger = require("../logger");

const commands = {
    showLevelLeaderboardCommand: require("../commands/level/showLevelLeaderboardCommand"),
    showGoldLeaderboardCommand:  require("../commands/economy/showGoldLeaderboardCommand"),
    showUserStatusCommand: require("../commands/status/showUserStatusCommand")
};

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg ] = info;

        Logger.debug(`Processing button handler: ${command}.${actionHandler}`);
        await commands[command][actionHandler](interaction, guildId, memberId, customArg);
    }
}