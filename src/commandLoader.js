const fs = require("fs");
const path = require('node:path');
const Discord = require("discord.js");

const Logger = require("./logger");

const commands = [];

module.exports = {
    loadAllCommands(discordClient) {
        discordClient.commands = new Discord.Collection();
    
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);
    
        for (const folder of commandFolders) {
            if (folder.endsWith(".js")) {
                continue;
            }

            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    discordClient.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                } else {
                    Logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    },
    async deployAllCommands() {
        try {
            const rest = new Discord.REST().setToken(process.env.TOKEN);
            Logger.info(`Started refreshing ${commands.length} application (/) commands.`);
            
            const applicationId = process.env.APPLICATION_ID;
            const debugGuildId = process.env.DEBUG_GUILD_ID;
            const commandDeployRoute = debugGuildId
                ? Discord.Routes.applicationGuildCommands(applicationId, debugGuildId) 
                : Discord.Routes.applicationCommands(applicationId);

            const data = await rest.put(
                commandDeployRoute,
                { body: commands },
            );

            Logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            Logger.error(error);
        }
    }
}
