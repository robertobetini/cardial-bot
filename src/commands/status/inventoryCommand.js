const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const InventoryService = require("../../services/inventoryService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Remove usuário por completo (status, atributos, itens, perícias, etc.)")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(false)
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const target = interaction.options.getUser("user") || interaction.member;

        if (target.id !== interaction.member.id) {
            RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        }

        const inventory = InventoryService.getFullInventory(target.id, guildId);
        
        await interaction.editReply(`Inventário (${inventory.getInventoryOccupiedSlots()}/${inventory.getTotalSlots()}):\`\`\`\n${JSON.stringify(inventory.items.map(ii => ({ name: ii.item.name, count: ii.count})), null, 2)}\`\`\``);
    },
};
