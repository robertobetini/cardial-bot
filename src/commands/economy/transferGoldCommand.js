const Discord = require("discord.js");
const EconomyService = require("../../services/economyService");
const { SilentError } = require("../../errors/silentError");

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

        if (target.id === interaction.user.id) {
            throw new SilentError("Você não pode transferir dinheiro para si mesmo .-.");
        }

        EconomyService.transferGold(interaction.guild.id, interaction.user, target, amount);

        await interaction.editReply(`$${amount} transferido de ${Discord.userMention(interaction.user.id)} para ${Discord.userMention(target.id)}.`);
    }
}

