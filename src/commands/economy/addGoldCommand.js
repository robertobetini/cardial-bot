const Discord = require("discord.js");

const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const data = new Discord.SlashCommandBuilder()
    .setName("addgold")
    .setDescription("Adiciona GOLD ao(s) usuário(s) escolhido(s)")
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade de GOLD a adicionar ao(s) usuário(s)")
            .setMinValue(1)
            .setRequired(true)
    );

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

module.exports = {
    data,
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);

        const amount = interaction.options.getInteger("quantidade");
        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        EconomyService.addGold(targets.users, amount);

        await interaction.editReply(`${amount} GOLD concedido a ${targets.mentions}.`);
    }
}
