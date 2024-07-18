const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const ProgressionService = require("../../services/progressionService");
const UserService = require("../../services/userService");

const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");
const Constants = require("../../constants");

const data = new Discord.SlashCommandBuilder()
    .setName("addmaestria")
    .setDescription("Adiciona Maestria ao(s) usuário(s) escolhido(s)")
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade de Maestria a fornecer ao(s) usuário(s)")
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

        ProgressionService.addMasteryExp(targets.users, amount);
        UserService.batchUpsert(targets.users, true);

        await interaction.editReply(`${amount} Maestria concedido a ${targets.mentions}.`);
    }
}
