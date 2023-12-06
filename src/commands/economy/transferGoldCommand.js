const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");
const User = require("../../models/user");

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
        const target = interaction.options.getUser("user");
		const amount = interaction.options.getInteger("quantidade");

        let party = await userDAO.get(interaction.user.id, interaction.guild.id);
        if (!party) {
            party = new User(
                interaction.user.id,
                interaction.guild.id,
                interaction.user.username
            );
        }

        let counterparty = await userDAO.get(target.id, interaction.guild.id);
        if (!counterparty) {
            counterparty = new User(
                target.id,
                interaction.guild.id,
                target.username
            );
        }

        try {
            party.tryUpdateGold(-amount);
            counterparty.tryUpdateGold(amount);
    
            await userDAO.batchUpsert([ party, counterparty ]);
            await interaction.reply(`$${amount} transferido de ${Discord.userMention(interaction.user.id)} para ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.reply(err.message);
        }
    }
}

