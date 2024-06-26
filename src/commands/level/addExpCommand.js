const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const ProgressionService = require("./../../services/progressionService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("addexp")
        .setDescription("Adiciona EXP ao usuário escolhido")
        .addUserOption(option =>
			option
				.setName("user")
				.setDescription("O usuário que irá receber a EXP")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de EXP a fornecer ao usuário")
                .setMinValue(1)
                .setRequired(true)),
    async execute(interaction) {
        if (!RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
            return;
        };
        
        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("quantidade");

        ProgressionService.addExp(interaction.guild.id, target, amount);

        const message = `${amount} EXP concedido a ${Discord.userMention(target.id)}.`;
        await interaction.editReply({ content: message });
    }
}
