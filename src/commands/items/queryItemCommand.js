const Discord = require("discord.js");

const ItemService = require("../../services/itemService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");
const itemTypes = ItemService.getItemTypes();
const ALL_TYPES = "all";

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("buscaitem")
        .setDescription("Busca informações de um item pelo nome")
        .addStringOption(option => 
            option
                .setName("categoria")
                .setDescription("Categoria do item")
                .setChoices(
                    [{ name: "Todas", value: ALL_TYPES }]
                        .concat(itemTypes.map(type => ({ name: Constants.TRANSLATION[type], value: type })))   
                )
                .setRequired(true)
        )
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
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    extExecute: async (interaction, guildId, userId, sourceCommand, selectedItemId) => {
        const item = ItemService.get(selectedItemId);
        const response = {
            content: "Nenhum item encontrado!",
            ephemeral: true
        };

        if (item) {
            response.content = "";
            response.embeds = [ EmbededResponseService.getItemView(item) ];
        }

        await interaction.reply(response);
    },
    autocomplete: async (interaction) => {
        const itemType = interaction.options.getString("categoria");
        const queryName = interaction.options.getFocused();
        if (!queryName) {
            return;
        }
        
        const choices = ItemService.like(queryName, 25, false, itemType !== ALL_TYPES ? itemType : null);
        await interaction.respond(
            choices.map(c => ({ name: `[${Constants.TRANSLATION[c.type]}] ${c.name}`, value: c.id }))
        );
    }
}
