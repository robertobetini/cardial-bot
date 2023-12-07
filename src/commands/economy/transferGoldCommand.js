const Discord = require("discord.js");
const AdmService = require("./../../services/admService");
const EconomyService = require("../../services/economyService");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("enviargold")
        .setDescription("Transfere GOLD para outro usuário")
        .addUserOption(option =>
			option
				.setName("user")
				.setDescription("O usuário que irá receber GOLD")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de GOLD a transferir")
                .setMinValue(1)
                .setRequired(true)),
    async execute(interaction) {
        try {
            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("quantidade");

            await EconomyService.transferGold(interaction.guild.id, interaction.user, target, amount);

            await interaction.reply(`$${amount} transferido de ${Discord.userMention(interaction.user.id)} para ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}

