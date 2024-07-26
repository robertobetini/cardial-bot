const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const InventoryService = require("../../services/inventoryService");
const EmbededResponseService = require("../../services/embededResponseService");

const Logger = require("../../logger");

const createSelectOptions = (optionList, selected) => {
    const options = [];
    for (let item of optionList) {
        let option = new Discord.StringSelectMenuOptionBuilder()
            .setLabel(item.label)
            .setValue(item.value);
        
        if (item.value == selected) {
            option.setDefault(true);
        }

        options.push(option);
    }

    return options;
}

const buildHomeActionRows = (guildId, userId) => {
    const removeItemButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:inventoryCommand:removeItem`)
        .setLabel("Remover item")
        .setStyle(Discord.ButtonStyle.Danger);

    return [new Discord.ActionRowBuilder().addComponents(removeItemButton)];
};

const buildRemoveItemActionRows = (guildId, userId, items) => {
    const removeItemButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:inventoryCommand:confirmRemoveItem`)
        .setLabel("Remover")
        .setStyle(Discord.ButtonStyle.Danger);

    const selectItemMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:inventoryCommand:selectItem`)
        .addOptions(createSelectOptions(items));

    return [
        new Discord.ActionRowBuilder().addComponents(selectItemMenu),
        new Discord.ActionRowBuilder().addComponents(removeItemButton)
    ];
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Mostra itens do inventário do usuário")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(false)
    ),
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const target = interaction.options.getUser("user") || interaction.member;

        if (target.id !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const inventory = InventoryService.getFullInventory(target.id, guildId);
        const embed = EmbededResponseService.getInventoryView(inventory, target);
        
        await interaction.editReply({
            embeds: [embed],
            components: buildHomeActionRows(),
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    removeItem: (interaction, guildId, userId) => {

        interaction.message.edit({
            components: buildRemoveItemActionRows(guildId, userId)
        });
    }
};
