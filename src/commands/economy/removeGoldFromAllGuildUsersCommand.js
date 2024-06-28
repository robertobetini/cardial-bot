const Discord = require("discord.js");

const RoleService = require("./../../services/roleService");
const EconomyService = require("../../services/economyService");

const Constants = require("../../constants");

const TIME_WINDOW_IN_MINUTES = 2;
let count = 0;
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("retirargoldtodos")
        .setDescription("Remove todo o GOLD de todos os usuários através de dupla aprovação"),
    async execute(interaction) {
        RoleService.ensureMemberIsOwner(interaction.guild, interaction.member);

        count++;
        const timer = setTimeout(() => count = 0, TIME_WINDOW_IN_MINUTES * Constants.MINUTE_IN_MILLIS);
        if (count < 2) {
            await interaction.editReply(`Use o comando \`/retirargoldtodos\` novamente em menos de ${TIME_WINDOW_IN_MINUTES} minutos para confirmar a ação.`);
            return;
        }

        timer.unref();
        count = 0;

        EconomyService.clearGoldFromAllUsers(interaction.guild.id);
        await interaction.editReply(`Todo o GOLD :coin: foi removido dos usuários.`);
    }
}

