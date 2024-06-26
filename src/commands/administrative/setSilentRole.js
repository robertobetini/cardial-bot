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
        const role = interaction.options.getRole("cargo");

        if (interaction.user.id !== interaction.guild.ownerId) {
            await interaction.editReply("Apenas o dono do servidor pode alterar o cargo de SILENT.");
            return;
        }
        
        const silentRole = new Role(interaction.guild.id, role.id, Role.SILENT_TYPE);
        RoleService.upsert(silentRole);
        await interaction.editReply("Cargo de SILENT alterado com sucesso.");
    }
}
