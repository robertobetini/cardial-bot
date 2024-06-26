const Discord = require("discord.js");

const UserService = require("../services/userService");

const Logger = require("../logger");

module.exports = {
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
            const u = UserService.get(interaction.guild.id, user.id, true)
            if (u == null || !u.attributes.firstAttributionDone) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }
            result.users.push(u);
        }

        Logger.debug("Consulta de fichas realizada");
        return result;
    }
};
