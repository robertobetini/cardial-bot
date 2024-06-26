const Discord = require("discord.js");

const Logger = require("../logger");
const Constants = require("../constants");

module.exports = {
    handleAsync: async (interaction) => {
        const commandName = interaction.commandName;
        const command = interaction.client.commands.get(commandName);
	
        if (!command) {
            Logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // reply at command acknowledgement and later edit to avoid losing interaction
        await interaction.deferReply({ 
            ephemeral: Constants.EPHEMERAL_COMMANDS.findIndex(c => c === commandName) >= 0
        });

        Logger.debug(`Executing command: ${interaction.commandName}`);
        await command.execute(interaction, interaction.token);
    }
};