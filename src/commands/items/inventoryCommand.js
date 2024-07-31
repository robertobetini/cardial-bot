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

    if (optionList?.length > 0) {
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

const buildBackToExternalCommandRows = (guildId, userId, externalCommand) => {
    const buildBackToExternalCommandButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:${externalCommand}:extGotoHome`)
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Secondary);

    return [ new Discord.ActionRowBuilder().addComponents(buildBackToExternalCommandButton) ];
}

const buildOptionList = (inventory) => inventory.items.map(ii => ({ label: ii.item.name, value: ii.item.id }));

const createOriginalMessageCacheEntry = async (interaction, guildId, userId) => {
    const key = guildId + userId;
    if (originalInteractions[key]) {
        try {
            await originalInteractions[key]?.deleteReply();
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
        return await interaction.editReply({
            embeds: [embed],
            components,
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    extExecute: async (interaction, guildId, userId, sourceCommand) => {
        await interaction.deferReply({ ephemeral: true });
        const target = await interaction.guild.members.fetch(userId);
        if (target.id !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const inventory = InventoryService.getFullInventory(target.id, guildId);
        const embed = EmbededResponseService.getInventoryView(inventory, target);
        const optionList = buildOptionList(inventory);
        const components = optionList.length > 0 
            ? buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN, sourceCommand) 
            : buildBackToExternalCommandRows(guildId, userId, sourceCommand);

        await createOriginalMessageCacheEntry(interaction, guildId, interaction.member.id);
        const message = await interaction.editReply({
            embeds: [embed],
            components,
            files: [EmbededResponseService.FOOTER_IMAGE]
        });

        eventEmitter.emit(`inventoryCommand_extExecute`, guildId, interaction.member.id);
        return message;
    },
    removeItem: async (interaction, guildId, userId) => {
        await interaction.deferUpdate();
        const inventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(inventory);
        if (optionList.length < 1) {
            return;
        }

        const key = guildId + userId;
        await originalInteractions[key]?.editReply({
            components: buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN)
        });
    },
    showConfirmRemovalModal: async (interaction, guildId, userId, selected) => {
        if (selected === NULL_SELECTION_TOKEN) {
            await interaction.deferUpdate();
            return;
        }
        if (userId !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
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
        await interaction.deferUpdate();
        if (userId !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const quantity = parseInt(interaction.fields.getTextInputValue("quantity"));
        if (isNaN(quantity) || quantity < 1) {
            return;
        }

        const inventory = InventoryService.getFullInventory(userId, guildId);
        const selectedItemIndex = inventory.items.findIndex(ii => ii.item.id === selected);
        const selectedItem = inventory.items[selectedItemIndex];
        selectedItem.count -= quantity;

        InventoryService.update(userId, guildId, selectedItem);
        Logger.info(`Player with ${userId} removed item ${selectedItem.item.name} [${quantity}x]`);

        const updatedInventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(updatedInventory);

        const target = await interaction.guild.members.fetch(userId);
        const embed = EmbededResponseService.getInventoryView(updatedInventory, target);        

        const backToSourceCommandButton = interaction.message.components[1].components.find(c => c.data.label === "Voltar");
        const customId = backToSourceCommandButton?.data?.custom_id || "";
        const info = customId.split(":");
        const externalCommand = info.length > 1 ? info[2] : "";

        const key = guildId + interaction.member.id;
        await originalInteractions[key]?.editReply({
            embeds: [embed],
            components: optionList.length > 0 
                ? buildHomeActionRows(guildId, userId, optionList, NULL_SELECTION_TOKEN, externalCommand)
                : buildHomeActionRows(guildId, userId)
        });
    },
    selectItem: async (interaction, guildId, userId, sourceCommand) => {
        await interaction.deferUpdate();
        if (userId !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const inventory = InventoryService.getFullInventory(userId, guildId);
        const optionList = buildOptionList(inventory);
        if (optionList.length < 1) {
            return;
        }

        const key = guildId + interaction.member.id;
        const selectedItem = interaction.values[0];

        await originalInteractions[key]?.editReply({
            components: buildHomeActionRows(guildId, userId, optionList, selectedItem, sourceCommand)
        });
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
        const message = await interaction.reply({
            embeds: [embed],
            components,
            ephemeral: true
        });

        eventEmitter.emit(`inventoryCommand_extGotoHome`, guildId, interaction.member.id);
        return message;
    }
};

// events
eventEmitter.on("showUserStatusCommand_extGotoHome", (guildId, userId) => {
    const key = guildId + userId;
    originalInteractions[key]?.deleteReply();
});
