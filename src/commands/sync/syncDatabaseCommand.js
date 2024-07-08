const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterDropsSyncService = require("../../services/monsterDropsSyncService");
const ItemSyncService = require("../../services/itemSyncService");

const Logger = require("../../logger");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("zsync")
        .setDescription("Atualiza os monstros, drops e items no banco de dados com as planilhas do Google Sheets"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        Logger.info("Atualizando itens de acordo com as planilhas");
        await ItemSyncService.sync();

        Logger.info("Atualizando drops de monstros de acordo com as planilhas");
        await MonsterDropsSyncService.sync();

        await interaction.editReply("Base atualizada com sucesso!");
    }
}
