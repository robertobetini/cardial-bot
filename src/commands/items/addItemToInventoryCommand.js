const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const ItemService = require("../../services/itemService");
const InventoryService = require("../../services/inventoryService");

const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");
const { autocomplete } = require("./queryItemCommand");
const { unityOfWork } = require("../../utils");

const Constants = require("../../constants");

const data = new Discord.SlashCommandBuilder()
    .setName("additem")
    .setDescription("Adiciona item ao(s) usuário(s) escolhido(s)")
    .addStringOption(option =>
        option
            .setName("nome")
            .setDescription("Nome do item")
            .setAutocomplete(true)
            .setRequired(true)
    );

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

data.addIntegerOption(option =>
    option
        .setName("quantidade")
        .setDescription("Quantidade do item a fornecer ao(s) usuário(s)")
        .setMinValue(1)
);
module.exports = {
    data,
    execute: async (interaction) => {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const itemId = interaction.options.getString("nome");
        const amount = interaction.options.getInteger("quantidade") || 1;
        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        const item = ItemService.get(itemId);
        if (!item) {
            await interaction.editReply("Nenhum item encontrado!");
            return;
        }

        const successful = await unityOfWork(async () => {
            for (const user of targets.users) {
                const inventory = InventoryService.getFullInventory(user.userId, user.guildId);
                if (!inventory.tryAddItem(item, amount)) {
                    await interaction.editReply(`O jogador ${user.playerName} não possui slots para receber o item`);
                    return false;
                }
    
                InventoryService.upsertFullInventory(inventory);
            }

            return true;
        });

        if (!successful) {
            return;
        }

        await interaction.editReply(`Concedido ${item.name} [x${amount}] aos jogadores ${targets.users.map(user => user.playerName).join(", ")}`);
    },
    autocomplete
}
