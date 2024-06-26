const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const ProgressionService = require("./../../services/progressionService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirarexp")
        .setDescription("Remove EXP do usuário escolhido")
        .addUserOption(option =>
			option
				.setName("user")
				.setDescription("O usuário de quem irá ser retirada EXP")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de EXP a retirar ao usuário")
                .setMinValue(1)
                .setRequired(true)),
    async execute(interaction) {
        if (!RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            interaction.editReply("Você não possui cargo de ADM para executar o comando.");
            return;
        };
        
        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("quantidade");

        ProgressionService.addExp(interaction.guild.id, target, -amount);

        await interaction.editReply(`${amount} EXP retirado de ${Discord.userMention(target.id)}.`);
    }
}
