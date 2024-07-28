const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const InventoryService = require("../../services/inventoryService");
const EmbededResponseService = require("../../services/embededResponseService");
const ItemService = require("../../services/itemService");

const Logger = require("../../logger");
const Constants = require("../../constants");
const eventEmitter = require("../../events");

const originalInteractions = {};
const CACHE_LIFETIME = 16 * Constants.MINUTE_IN_MILLIS;
const NULL_SELECTION_TOKEN = "NULL_SELECTION";

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

const buildHomeActionRows = (guildId, userId, optionList, selected, externalCommand = "") => {
    const actionRows = [];
    const isNullSelection = !selected || selected === NULL_SELECTION_TOKEN;
    
    const removeItemButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:inventoryCommand:showConfirmRemovalModal:${selected}`)
        .setLabel("Remover")
        .setStyle(Discord.ButtonStyle.Danger)
        .setDisabled(isNullSelection);

    const fetchItemButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:queryItemCommand:extExecute:inventoryCommand:${selected}`)
        .setLabel("Detalhes")
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(isNullSelection);

    const buttons = [fetchItemButton, removeItemButton];

    if (optionList.length > 0) {
        const selectItemMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`${guildId}:${userId}:inventoryCommand:selectItem:${externalCommand}`)
            .setPlaceholder("Escolha o item para remover")
            .addOptions(createSelectOptions(optionList, selected));
        const actionRow = new Discord.ActionRowBuilder().addComponents(selectItemMenu);
        actionRows.push(actionRow);
    }

    if (externalCommand) {
        const backToExternalCommandButton = new Discord.ButtonBuilder()
            .setCustomId(`${guildId}:${userId}:${externalCommand}:extGotoHome`)
            .setLabel("Voltar")
            .setStyle(Discord.ButtonStyle.Secondary);

        buttons.unshift(backToExternalCommandButton);
    }

    const buttonActionRow = new Discord.ActionRowBuilder().addComponents(buttons);
    actionRows.push(buttonActionRow);
    return actionRows;
}

const buildOptionList = (inventory) => inventory.items.map(ii => ({ label: ii.item.name, value: ii.item.id }));

const createOriginalMessageCacheEntry = async (interaction, guildId, userId) => {
    const key = guildId + userId;
    if (originalInteractions[key]) {
        try {
            await originalInteractions[key].deleteReply();
        } catch {
            Logger.warn("Tried to delete non-existing interaction message");
        }
    }
    originalInteractions[key] = interaction;
    setTimeout(() => delete originalInteractions[key], CACHE_LIFETIME);
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
        const optionList = buildOptionList(inventory);
        const components = optionList.length > 0 ? buildHomeActionRows(guildId, target.id, optionList, NULL_SELECTION_TOKEN) : [];

        await createOriginalMessageCacheEntry(interaction, guildId, interaction.member.id);
        await interaction.editReply({
            embeds: [embed],
            components,
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    extExecute: async (interaction, guildId, userId, sourceCommand) => {
        console.log(sourceCommand);
        const target = await interaction.guild.members.fetch(userId);

        if (target.id !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const inventory = InventoryService.getFullInventory(target.id, guildId);
        const embed = EmbededResponseService.getInventoryView(inventory, target);
        const optionList = buildOptionList(inventory);
        const components = optionList.length > 0 
            ? buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN, sourceCommand) 
            : [ new Discord.ActionRowBuilder().addComponents(backToExternalCommandButton) ];


        await createOriginalMessageCacheEntry(interaction, guildId, interaction.member.id);
        await interaction.reply({
            embeds: [embed],
            components,
            files: [EmbededResponseService.FOOTER_IMAGE],
            ephemeral: true
        });

        eventEmitter.emit(`inventoryCommand_extExecute`, guildId, interaction.member.id);
    },
    removeItem: async (interaction, guildId, userId) => {
        const inventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(inventory);
        if (optionList.length < 1) {
            await interaction.deferUpdate();
            return;
        }

        const key = guildId + userId;
        await Promise.all([
            originalInteractions[key].editReply({
                components: buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN)
            }),
            interaction.deferUpdate()
        ]);
    },
    showConfirmRemovalModal: async (interaction, guildId, userId, selected) => {
        if (userId !== interaction.member.id || selected === NULL_SELECTION_TOKEN) {
            await interaction.deferUpdate();
            return;
        }

        const item = ItemService.get(selected);
        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${userId}:inventoryCommand:confirmRemoval:${selected}`)
			.setTitle(`Remover ${item.name}`);

        const input = new Discord.TextInputBuilder()
            .setCustomId("quantity")
            .setLabel("Quantidade")
            .setStyle(Discord.TextInputStyle.Short)
            .setPlaceholder("Número entre 1 e 999")
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        const actionRows = [ new Discord.ActionRowBuilder().addComponents(input) ];
        modal.addComponents(actionRows);

        await interaction.showModal(modal);
    },
    confirmRemoval: async (interaction, guildId, userId, selected) => {
        if (userId !== interaction.member.id) {
            await interaction.deferUpdate();
            return;
        }

        const quantity = parseInt(interaction.fields.getTextInputValue("quantity"));
        if (isNaN(quantity) || quantity < 1) {
            await interaction.deferUpdate();
            return;
        }

        const inventory = InventoryService.getFullInventory(userId, guildId);
        const selectedItemIndex = inventory.items.findIndex(ii => ii.item.id === selected);
        const selectedItem = inventory.items[selectedItemIndex];
        selectedItem.count -= quantity;

        InventoryService.update(userId, guildId, selectedItem);
        Logger.info(`Player ${interaction.member.displayName} removed item ${selectedItem.item.name} [${quantity}x]`);

        const updatedInventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(updatedInventory);
        const embed = EmbededResponseService.getInventoryView(updatedInventory, interaction.member);

        const key = guildId + userId;
        await Promise.all([
            originalInteractions[key].editReply({
                embeds: [embed],
                components: optionList.length > 0 
                    ? buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN)
                    : buildHomeActionRows(guildId, userId)
            }),
            interaction.deferUpdate()
        ]);
    },
    selectItem: async (interaction, guildId, userId, sourceCommand) => {
        if (userId !== interaction.member.id) {
            await interaction.deferUpdate();
            return;
        }

        const inventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(inventory);
        if (optionList.length < 1) {
            await interaction.deferUpdate();
            return;
        }

        const key = guildId + interaction.member.id;
        const selectedItem = interaction.values[0];
        await Promise.all([
            originalInteractions[key].editReply({
                components: buildHomeActionRows(guildId, userId, optionList, selectedItem, sourceCommand)
            }),
            interaction.deferUpdate()
        ]);
    },
    extGotoHome: async (interaction, guildId, userId, sourceCommand) => {
        if (userId !== interaction.member.id) {
            await interaction.deferUpdate();
            return;
        }

        const member = await interaction.guild.members.fetch(userId);
        const inventory = InventoryService.getFullInventory(userId, guildId);
        const embed = EmbededResponseService.getInventoryView(inventory, member);
        const optionList = buildOptionList(inventory);

        const backToExternalCommandButton = new Discord.ButtonBuilder()
            .setCustomId(`${guildId}:${userId}:${sourceCommand}:extGotoHome`)
            .setLabel("Voltar")
            .setStyle(Discord.ButtonStyle.Secondary);

        const components = buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN, backToExternalCommandButton);

        await createOriginalMessageCacheEntry(interaction, guildId, interaction.member.id);
        await interaction.reply({
            embeds: [embed],
            components,
            ephemeral: true
        });

        eventEmitter.emit(`inventoryCommand_extGotoHome`, guildId, interaction.member.id);
    }
};

// events
eventEmitter.on("showUserStatusCommand_extGotoHome", (guildId, userId) => {
    const key = guildId + userId;
    originalInteractions[key]?.deleteReply();
});
