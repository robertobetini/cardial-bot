const Logger = require("../logger");

module.exports = {
    handleAsync: async (interaction) => {
        const command = interaction.client.commands.get(interaction.commandName);
	
        if (!command) {
            Logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // reply at command acknowledgement and later edit to avoid losing interaction
        await interaction.reply(".");

        try {
            Logger.debug(`Executing command: ${interaction.commandName}`);
            await command.execute(interaction);
        } catch (error) {
            Logger.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp("There was an error while executing this command!");
            } else {
                await interaction.editReply("There was an error while executing this command!");
            }
        }
    }
};