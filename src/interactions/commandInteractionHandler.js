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

        try {
            Logger.debug(`Executing command: ${interaction.commandName}`);
            await command.execute(interaction, interaction.token);
        } catch (error) {
            Logger.error(error);
            interaction.replied || interaction.deferred 
                ? await interaction.followUp("There was an error while executing this command!")
                : await interaction.editReply("There was an error while executing this command!");
        }
    }
};