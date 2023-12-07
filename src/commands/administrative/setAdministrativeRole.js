const Discord = require("discord.js");
const admRoleDAO = require("./../../DAOs/admRoleDAO");
const AdmRole = require("../../models/admRole");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("cargoadm")
        .setDescription("Define o cargo de ADM")
        .addRoleOption(option =>
			option
				.setName("cargo")
				.setDescription("O cargo que será considerado como ADM pelo bot")
				.setRequired(true)),
    async execute(interaction) {
        const role = interaction.options.getRole("cargo");

        if (interaction.user.id !== interaction.guild.ownerId) {
            await interaction.reply("Apenas o dono do servidor pode alterar o cargo de ADM.");
        }
        
        const admRole = new AdmRole(interaction.guild.id, role.id);
        await admRoleDAO.upsert(admRole);
        await interaction.reply("Cargo de ADM alterado com sucesso.");
    }
}
