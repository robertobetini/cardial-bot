const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterSyncService = require("../../services/monsterSyncService");
const ItemSyncService = require("../../services/itemSyncService");
const InventoryService = require("../../services/inventoryService");

const { clearMonsterIdToNameMap } = require("../../utils");
const Lock = require("../../lock");

const lock = new Lock();

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("zsync")
        .setDescription("Atualiza os monstros, drops e items no banco de dados com as planilhas do Google Sheets"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);

        if (lock.locked) {
            await interaction.editReply("Atualização em andamento, aguarde um pouco para executar novamente.");
            return;
        }

        try {
            lock.lock();
            await ItemSyncService.sync();
            await MonsterSyncService.sync();
            clearMonsterIdToNameMap();
            await interaction.editReply("Base atualizada com sucesso!");
        } catch(err) {
            throw err;
        } finally {
            lock.unlock();
        }
    }
}
