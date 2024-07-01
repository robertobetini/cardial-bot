const Discord = require("discord.js");
const RoleService = require("../../services/roleService");
const StatsService = require("../../services/statsService");

const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");
const Constants = require("../../constants");

const data = new Discord.SlashCommandBuilder()
    .setName("resetmaestria")
    .setDescription("Reseta Maestria do(s) usuário(s) escolhido(s) para 0");

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

module.exports = {
    data,
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        for (const user of targets.users) {
            StatsService.updateSingleStat(user.userId, user.guildId, "totalMasteryExp", 0);
        }

        await interaction.editReply(`Maestria resetada para ${targets.mentions}.`);
    }
}
