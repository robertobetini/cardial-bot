const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");
const User = require("../../models/user");

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
        const target = interaction.options.getUser("user");
		const amount = interaction.options.getInteger("quantidade");

        let user = await userDAO.get(target.id, interaction.guild.id);

        if (!user) {
            user = new User(
                target.id,
                interaction.guild.id,
                target.username
            );
        }

        user.tryUpdateGold(amount);

        await userDAO.upsert(user);
        await interaction.reply(`$${amount} concedido a ${Discord.userMention(target.id)}.`);
    }
}

