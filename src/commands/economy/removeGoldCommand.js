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
        if (!RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
            return;
        }

        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("quantidade");

        EconomyService.addGold(interaction.guild.id, target, -amount);

        await interaction.editReply(`$${amount} removido de ${Discord.userMention(target.id)}.`);
    }
}

