const Discord = require("discord.js");
const RoleService = require("../../services/roleService");
const Role = require("../../models/role");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("cargosilent")
        .setDescription("Define o cargo de SILENT")
        .addRoleOption(option =>
			option
				.setName("cargo")
				.setDescription("O cargo que será considerado como SILENT pelo bot")
				.setRequired(true)),
    async execute(interaction) {
        try {
            const role = interaction.options.getRole("cargo");
    
            if (interaction.user.id !== interaction.guild.ownerId) {
                await interaction.editReply("Apenas usuários com o cargo de ADM podem alterar o cargo de SILENT.");
            }
            
            const silentRole = new Role(interaction.guild.id, role.id, Role.SILENT_TYPE);
            await RoleService.upsert(silentRole);
            await interaction.editReply("Cargo de SILENT alterado com sucesso.");
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}
