const Discord = require("discord.js");
const path = require('node:path');
const fs = require("fs");

const commands = [];

module.exports = {
    loadAllCommands(discordClient) {
        discordClient.commands = new Discord.Collection();
    
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);
    
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    discordClient.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    },
    async deployAllCommands() {
        try {
            const rest = new Discord.REST().setToken(process.env.TOKEN);
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
            const data = await rest.put(
                Discord.Routes.applicationCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
                { body: commands },
            );
    
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    }
}
