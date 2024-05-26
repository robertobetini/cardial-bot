const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirargoldtodos")
        .setDescription("Remove todo o GOLD de todos os usuários"),
    async execute(interaction) {
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
            }

            await EconomyService.clearGoldFromAllUsers(interaction.guild.id);

            await interaction.editReply(`Todo o GOLD foi removido dos usuários.`);
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}

