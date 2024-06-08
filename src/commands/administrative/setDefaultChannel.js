const Discord = require("discord.js");
const RoleService = require("../../services/roleService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("canaldefault")
        .setDescription("Define o cargo de ADM")
        .addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("O canal que receberá por padrão comunicações do bot")
				.setRequired(true)),
    async execute(interaction) {
        try {
            const role = interaction.options.getChannel("channel");
    
            if (interaction.user.id !== interaction.guild.ownerId) {
                await interaction.editReply("Apenas o dono do servidor pode definir o canal padrão.");
            }
            
            const admRole = new Role(interaction.guild.id, role.id, Role.ADM_TYPE);
            await RoleService.upsert(admRole);
            await interaction.editReply("Cargo de ADM alterado com sucesso.");
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}
