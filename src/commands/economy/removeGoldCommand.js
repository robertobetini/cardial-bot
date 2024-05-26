const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

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
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                interaction.editReply("Você não possui cargo de ADM para executar o comando.");
            }

            const target = interaction.options.getUser("user");
            const amount = interaction.options.getInteger("quantidade");

            await EconomyService.addGold(interaction.guild.id, target, -amount);

            await interaction.editReply(`$${amount} removido de ${Discord.userMention(target.id)}.`);
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}

