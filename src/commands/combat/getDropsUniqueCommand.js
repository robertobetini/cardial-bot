const Discord = require("discord.js");

const Constants = require("../../constants");

const { addMultipleUserOptions, addMultipleAutocompletes, getStringsFromInput } = require ("../helpers");
const { drop, computeVote, autocomplete } = require("./getDropsCommand");

const AUTOCOMPLETE_OPTION_BASE_NAME = "mob";

const data = new Discord.SlashCommandBuilder()
    .setName("dropar")
    .setDescription("Gera uma lista de drops a partir dos mobs escolhidos")
    .addIntegerOption(option =>
        option
            .setName("quantidade")
            .setDescription("Quantidade do mob a ser adicionado")
            .setMinValue(1)
            .setRequired(true)
    );

addMultipleAutocompletes(data, AUTOCOMPLETE_OPTION_BASE_NAME, 1, 1);
addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 0);

module.exports = {
    data,
    execute: async (interaction) => { 
        const count = interaction.options.getInteger("quantidade");
        const monsterId = getStringsFromInput(interaction, AUTOCOMPLETE_OPTION_BASE_NAME, 1).data[0];
        const monsterIds = [];
        for (let i = 0; i < count; i++) {
            monsterIds.push(monsterId);
        }

        await drop(interaction, monsterIds);
    },
    autocomplete,
    pollHandler: async (pollAnswer, pollId, isVoteRemove) => await computeVote(pollAnswer, pollId, isVoteRemove)
}
