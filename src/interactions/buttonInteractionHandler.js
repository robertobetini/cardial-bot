const Logger = require("../logger");

const commands = {
    showLevelLeaderboardCommand: require("../commands/level/showLevelLeaderboardCommand"),
    showGoldLeaderboardCommand:  require("../commands/economy/showGoldLeaderboardCommand"),
    showUserStatusCommand: require("../commands/status/showUserStatusCommand"),
    smartRollCommand: require("../commands/rolls/smartRollCommand"),
    pureRollCommand: require("../commands/rolls/pureRollCommand")
};

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg0, customArg1, customArg2 ] = info;

        Logger.debug(`Processing button handler: ${command}.${actionHandler}`);
        await commands[command][actionHandler](interaction, guildId, memberId, customArg0, customArg1, customArg2);
    }
}