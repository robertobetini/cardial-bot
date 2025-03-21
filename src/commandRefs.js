const fs = require("fs");
const path = require("path");

const commandRefs = {};

const loadCommandRefs = () => {
    if (Object.keys(commandRefs).length > 0) {
        return commandRefs;
    }

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
