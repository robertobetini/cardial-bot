const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
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
        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("quantidade");

        EconomyService.transferGold(interaction.guild.id, interaction.user, target, amount);

        await interaction.editReply(`$${amount} transferido de ${Discord.userMention(interaction.user.id)} para ${Discord.userMention(target.id)}.`);
    }
}

