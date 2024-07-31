const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const ProgressionService = require("../../services/progressionService");
const UserService = require("../../services/userService");
const EconomyService = require("../../services/economyService");

const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require("../helpers");

const TIME_WINDOW_IN_MINUTES = 2;
let count = 0;

const data = new Discord.SlashCommandBuilder()
    .setName("retirar")
    .setDescription("Remove EXP, Maestria ou GOLD do(s) usuário(s) escolhido(s) ou de todos os usuários")
    .addStringOption(option =>
        option
            .setName("tipo")
            .setDescription("Tipo de remoção a ser realizada")
            .setRequired(true)
            .addChoices(
                { name: "EXP", value: "exp" },
                { name: "Maestria", value: "maestria" },
                { name: "GOLD", value: "gold" },
                { name: "GOLD de todos", value: "gold_todos" }
            )
    )
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade a retirar")
            .setMinValue(1)
            .setRequired(true)
    );


addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

module.exports = {
    data,
    async execute(interaction) {
        const type = interaction.options.getString("tipo");
        const amount = interaction.options.getInteger("quantidade");

        let message = "";

        if (type === "gold_todos") {
            RoleService.ensureMemberIsOwner(interaction.guild, interaction.member);

            count++;
            const timer = setTimeout(() => count = 0, TIME_WINDOW_IN_MINUTES * Constants.MINUTE_IN_MILLIS);
            if (count < 2) {
                await interaction.editReply(`Use o comando \`/retirar\` com o tipo "GOLD de todos" novamente em menos de ${TIME_WINDOW_IN_MINUTES} minutos para confirmar a ação.`);
                return;
            }

            timer.unref();
            count = 0;

            EconomyService.clearGoldFromAllUsers(interaction.guild.id);
            message = `Todo o GOLD :coin: foi removido dos usuários.`;

            await interaction.editReply(message);
            return;
        }

        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);

        switch (type) {
            case "exp":
                ProgressionService.addExp(targets.users, -amount, true);
                message = `${amount} EXP removidos de ${targets.mentions}.`;
                break;
            case "maestria":
                const masteryExp = Math.ceil(amount / 2);
                ProgressionService.addMasteryExp(targets.users, -masteryExp);
                message = `${masteryExp} maestria removidos de ${targets.mentions}.`;
                break;
            case "gold":
                EconomyService.addGold(targets.users, -amount);
                message = `$${amount} GOLD :coin: removido de ${targets.mentions}.`;
                break;
        }

        UserService.batchUpsert(targets.users, true);

        await interaction.editReply(message);
    }
}
