const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const StatusService = require("./../../services/statusService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placarnivel")
        .setDescription("Mostra o placar atual de níveis dos usuários"),
    async execute(interaction) {
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
                return;
            };
            
            const leaderboard = await StatusService.getExpLeaderboard(interaction.guild.id, "totalExp");
    
            await interaction.editReply(leaderboard);
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}
