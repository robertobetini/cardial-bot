const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");
const User = require("../../models/user");

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
            user.addExp(-amount);
            await userDAO.upsert(user);
            await interaction.reply(`${amount} EXP retirado de ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}

