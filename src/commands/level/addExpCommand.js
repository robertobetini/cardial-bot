const Discord = require("discord.js");
const AdmService = require("./../../services/admService");
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
        try {
            if (!await AdmService.isMemberAdm(interaction.guild, interaction.member)) {
                interaction.reply("Você não possui cargo de ADM para executar o comando.");
                return;
            };
            
            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("quantidade");

            await ProgressionService.addExp(interaction.guild.id, target, amount);

            await interaction.reply(`${amount} EXP concedido a ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}
