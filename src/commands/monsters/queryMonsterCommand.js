const Discord = require("discord.js");

const MonsterService = require("../../services/monsterService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("buscamob")
        .setDescription("Busca informações de um mob pelo nome")
        .addStringOption(option =>
            option
                .setName("nome")
                .setDescription("Nome do mob")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const monsterId = interaction.options.getString("nome");
        const monster = MonsterService.get(monsterId);
        const embed = EmbededResponseService.getMonsterView(monster);

        await interaction.editReply({
            embeds: [embed],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    autocomplete: async (interaction) => {
        const queryName = interaction.options.getFocused();
        if (!queryName) {
            return;
        }
        
        const choices = MonsterService.like(queryName, 25);
        await interaction.respond(
            choices.map(c => ({ name: `${c.name}`, value: c.id }))
        );
    }
}
