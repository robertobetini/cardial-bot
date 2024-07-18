const Discord = require("discord.js");

const ItemService = require("../../services/itemService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("buscaitem")
        .setDescription("Busca informações de um item pelo nome")
        .addStringOption(option =>
            option
                .setName("nome")
                .setDescription("Nome do item")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const itemId = interaction.options.getString("nome");
        const item = ItemService.get(itemId);
        if (!item) {
            await interaction.editReply("Nenhum item encontrado!");
            return;
        }
        
        const embed = EmbededResponseService.getItemView(item);

        await interaction.editReply({
            embeds: [embed],
            files: [EmbededResponseService.FOOTER_IMAGE, EmbededResponseService.POTION_IMAGE]
        });
    },
    autocomplete: async (interaction) => {
        const queryName = interaction.options.getFocused();
        if (!queryName) {
            return;
        }
        
        const choices = ItemService.like(queryName, 25);
        await interaction.respond(
            choices.map(c => ({ name: `[${Constants.TRANSLATION[c.type]}] ${c.name}`, value: c.id }))
        );
    }
}
