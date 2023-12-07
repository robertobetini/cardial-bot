const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("addgold")
        .setDescription("Adiciona GOLD ao usuário escolhido")
        .addUserOption(option =>
			option
				.setName("user")
				.setDescription("O usuário que irá receber GOLD")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de GOLD a adicionar ao usuário")
                .setMinValue(1)
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                interaction.reply("Você não possui cargo de ADM para executar o comando.");
            }

            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("quantidade");

            await EconomyService.addGold(interaction.guild.id, target, amount);

            await interaction.reply(`$${amount} concedido a ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}
