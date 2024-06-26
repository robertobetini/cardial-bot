const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirargoldtodos")
        .setDescription("Remove todo o GOLD de todos os usuários"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        EconomyService.clearGoldFromAllUsers(interaction.guild.id);
        await interaction.editReply(`Todo o GOLD foi removido dos usuários.`);
    }
}

