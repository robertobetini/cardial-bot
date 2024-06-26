const Discord = require("discord.js");

const RoleService = require("./../../services/roleService");
const ProgressionService = require("./../../services/progressionService");

const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const data = new Discord.SlashCommandBuilder()
    .setName("retirarexp")
    .setDescription("Remove EXP do(s) usuário(s) escolhido(s)")
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade de EXP a retirar do(s) usuário(s)")
            .setMinValue(1)
            .setRequired(true)
    );

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

module.exports = {
    data,
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);;
        
        const amount = interaction.options.getInteger("quantidade");
        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        ProgressionService.addExp(targets.users, -amount, true);

        await interaction.editReply(`${amount} EXP retirado de ${targets.mentions}.`);
    }
}
