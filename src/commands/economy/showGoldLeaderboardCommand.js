const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const StatusService = require("./../../services/statusService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placargold")
        .setDescription("Mostra o placar atual de GOLD dos usuários"),
    async execute(interaction) {
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                interaction.reply("Você não possui cargo de ADM para executar o comando.");
                return;
            };

            const leaderboard = await StatusService.getGoldLeaderboard(interaction.guild.id);
    
            await interaction.reply(leaderboard);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}

