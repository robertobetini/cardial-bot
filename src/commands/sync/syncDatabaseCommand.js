const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterSyncService = require("../../services/monsterSyncService");
const ItemSyncService = require("../../services/itemSyncService");

const Logger = require("../../logger");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("zsync")
        .setDescription("Atualiza os monstros, drops e items no banco de dados com as planilhas do Google Sheets"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        await ItemSyncService.sync();
        await MonsterSyncService.sync();
        await interaction.editReply("Base atualizada com sucesso!");
    }
}
