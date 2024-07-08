const fs = require("fs");
const path = require("path");

const Logger = require("./logger");

const commandRefs = {};

const loadCommandRefs = () => {
    if (Object.keys(commandRefs).length > 0) {
        return commandRefs;
    }

    const foldersPath = path.join(__dirname, 'commands');
    Logger.info("Command folder found: " + foldersPath);
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
            Logger.info("Command found: " + filePath, Object.keys(commandRefs).length);
            
            if ('data' in command && 'execute' in command) {
                const commandName = path.basename(filePath).replace(".js", "");
                commandRefs[commandName] = command;
            }
        }
    }

    return commandRefs;
}

module.exports = {
    loadCommandRefs
};
