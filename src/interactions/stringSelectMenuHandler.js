const Logger = require("../logger");

const { loadCommandRefs } = require("../commandRefs");

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg ] = info;
        if (actionHandler == "void") {
            await interaction.deferUpdate();
            return;
        }

        Logger.debug(`Processing string select menu handler: ${command}.${actionHandler}`);
        await loadCommandRefs()[command][actionHandler](interaction, guildId, memberId, customArg);
    }
}