const Discord = require("discord.js");

const RoleService = require("./../../services/roleService");
const ProgressionService = require("./../../services/progressionService");
const UserService = require("../../services/userService");

const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const data = new Discord.SlashCommandBuilder()
    .setName("retirarexp")
    .setDescription("Remove Maestria do(s) usuário(s) escolhido(s)")
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade de Maestria a retirar do(s) usuário(s)")
            .setMinValue(1)
            .setRequired(true)
    );

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

data.addBooleanOption(option =>
    option
        .setName("ignoramaestria")
        .setDescription("Ignora maestria e remove apenas EXP")
        .setRequired(false)
);

module.exports = {
    data,
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);;
        
        const ignoreMastery = interaction.options.getBoolean("ignoramaestria");
        const amount = interaction.options.getInteger("quantidade");
        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        ProgressionService.addExp(targets.users, -amount, true);
        const masteryExp = Math.ceil(amount / 2);
        if (!ignoreMastery) {
            ProgressionService.addMasteryExp(targets.users, -masteryExp);
        }
        UserService.batchUpsert(targets.users, true);

        await interaction.editReply(`${amount} EXP e ${ignoreMastery ? 0 : masteryExp } retirados de ${targets.mentions}.`);
    }
}
