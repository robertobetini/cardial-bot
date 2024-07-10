const Discord = require("discord.js");

const UserService = require("../services/userService");

const Logger = require("../logger");

const capitalize = (name) => {
    return name[0].toUpperCase() + name.substring(1, name.length);
}

module.exports = {
    addMultipleAutocompletes: (slashCommandBuilder, optionBaseName, optionsCount, requiredOptionsCount) => {
        for (let i = 1; i <= optionsCount; i++) {
            slashCommandBuilder.addStringOption(option => 
                option
                    .setName(`${optionBaseName}${i}`)
                    .setDescription(`${capitalize(optionBaseName)} ${i}`)
                    .setAutocomplete(true)
                    .setRequired(i <= requiredOptionsCount)
            );
        }
    },
    addMultipleUserOptions: (slashCommandBuilder, optionsCount, requiredUserCount) => {
        for (let i = 1; i <= optionsCount; i++) {
            slashCommandBuilder.addUserOption(option => 
                option
                    .setName(`jogador${i}`)
                    .setDescription(`Jogador ${i}`)
                    .setRequired(i <= requiredUserCount)
            );
        }
    },
    getUsersFromInput: (interaction, inputCount) => {
        const result = { users: [], mentions: [] };

        for (let i = 1; i <= inputCount; i++) {
            const user = interaction.options.getUser(`jogador${i}`);
            if (!user) {
                continue;
            }
            result.mentions.push(Discord.userMention(user.id));
            
            Logger.debug(`Jogador ${user.username} adicionado à busca de fichas`);
            const u = UserService.get(interaction.guild.id, user.id, true);
            if (u == null || !u.attributes.firstAttributionDone) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }
            result.users.push(u);
        }

        Logger.debug("Consulta de fichas realizada");
        return result;
    },
    getStringsFromInput: (interaction, optionBaseName, inputCount) => {
        const result = { data: [] };

        for (let i = 1; i <= inputCount; i++) {
            const value = interaction.options.getString(`${optionBaseName}${i}`);
            result.data.push(value);
        }

        return result;
    }
};
