const commands = {
    showLevelLeaderboardCommand: require("../commands/level/showLevelLeaderboardCommand"),
    showGoldLeaderboardCommand:  require("../commands/economy/showGoldLeaderboardCommand")
};

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const buttonInfo = customId.split(":");

        const [ guildId, memberId, command, actionHandler ] = buttonInfo;

        await commands[command][actionHandler](interaction, guildId, memberId);
    }
}