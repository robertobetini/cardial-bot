const Logger = require("../logger");

const commands = {
    showUserStatusCommand: require("../commands/status/showUserStatusCommand")
};

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg ] = info;

        Logger.debug(`Processing modal handler: ${command}.${actionHandler}`);
        await commands[command][actionHandler](interaction, guildId, memberId, customArg);
    }
}