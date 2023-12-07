const Discord = require("discord.js");
const AdmService = require("./../../services/admService");
const StatusService = require("./../../services/statusService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placarnivel")
        .setDescription("Mostra o placar atual de níveis dos usuários"),
    async execute(interaction) {
        try {
            if (!await AdmService.isMemberAdm(interaction.guild, interaction.member)) {
                interaction.reply("Você não possui cargo de ADM para executar o comando.");
                return;
            };
            
            const leaderboard = await StatusService.getExpLeaderboard(interaction.guild.id, "totalExp");
    
            await interaction.reply(leaderboard);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}
