const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");
const User = require("../../models/user");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirargold")
        .setDescription("Remove GOLD do usuário escolhido")
        .addUserOption(option =>
			option
				.setName("user")
				.setDescription("O usuário que irá perder GOLD")
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName("quantidade")
				.setDescription("Quantidade de GOLD a remover ao usuário")
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

        try {
            user.tryUpdateGold(-amount);
    
            await userDAO.upsert(user);
            await interaction.reply(`$${amount} removido de ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}

