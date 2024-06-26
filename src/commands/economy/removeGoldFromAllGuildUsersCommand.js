const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirargoldtodos")
        .setDescription("Remove todo o GOLD de todos os usuários"),
    async execute(interaction) {
        if (!RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
        }

        EconomyService.clearGoldFromAllUsers(interaction.guild.id);

        await interaction.editReply(`Todo o GOLD foi removido dos usuários.`);
    }
}

