const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const StatusService = require("../../services/statusService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("status")
        .setDescription("Mostra o nível do usuário selecionado")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser("user");

        if (target.id !== interaction.user.id && !await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("É necessário cargo de ADM para consultar o status de outros usuários.");
        }

        const status = await StatusService.getUserStatus(interaction.guild.id, target);

        await interaction.editReply(status);
    }
}
