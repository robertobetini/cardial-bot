const Discord = require("discord.js");

const UserService = require("../../services/userService");

const Logger = require("../../logger");
const Constants = require("../../constants");

const data = new Discord.SlashCommandBuilder()
    .setName("iniciativa")
    .setDescription("Adiciona jogadores para teste de iniciativa");

for (let i = 1; i <= Constants.INITIATIVE_COMMAND_MAX_USERS; i++) {
    data.addUserOption(option => 
        option
            .setName(`jogador${i}`)
            .setDescription(`Jogador ${i}`)
            .setRequired(i === 1)
    );
}

module.exports = {
    data,
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const promises = [];

        for (let i = 1; i <= Constants.INITIATIVE_COMMAND_MAX_USERS; i++) {
            const user = interaction.options.getUser(`jogador${i}`);
            if (!user) {
                continue;
            }

            Logger.debug(`Adicionando jogador ${user.username} à busca de fichas`);
            promises.push(UserService.get(guildId, user.id, true));
        }

        const results = await Promise.all(promises);
        Logger.debug("Consulta de fichas realizada");

        results.findIndex(u => u == null || !u.attributes.firstAttributionDone) >= 0 
            ? await interaction.editReply("Existem usuários sem ficha ou com ficha incompleta.")
            : await interaction.editReply("Jogadores adicionados à batalha: " + results.reduce((text, current) => text += `${current.username} `, ""));
    }
}