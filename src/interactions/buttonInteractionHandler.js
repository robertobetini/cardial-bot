const Logger = require("../logger");

const { loadCommandRefs } = require("../commandRefs");

module.exports = {
    handleAsync: async (interaction) => {
        const customId = interaction.customId;

        const info = customId.split(":");
        const [ guildId, memberId, command, actionHandler, customArg0, customArg1, customArg2 ] = info;

        Logger.debug(`Processing button handler: ${command}.${actionHandler}`);
        console.log(customId);
        await loadCommandRefs()[command][actionHandler](interaction, guildId, memberId, customArg0, customArg1, customArg2);
    }
}