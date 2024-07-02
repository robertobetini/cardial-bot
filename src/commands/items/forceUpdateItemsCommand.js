const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const GoogleSheetsService = require("../../services/googleSheetsService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("atualizaitems")
        .setDescription("Atualiza os items no banco de dados com a planilha do Google Sheets"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        GoogleSheetsService.syncItems();
        await interaction.editReply("Base de itens atualizada com sucesso!");
    }
}
