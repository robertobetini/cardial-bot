const Logger = require("../logger");

const { loadCommandRefs } = require("../commandRefs");

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;
        Logger.debug(`Processing modal submit interaction ${interaction.id} (${customId})`);

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg ] = info;

        Logger.debug(`Processing modal handler: ${command}.${actionHandler}`);
        await loadCommandRefs()[command][actionHandler](interaction, guildId, memberId, customArg);
    }
}