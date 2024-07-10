const Discord = require("discord.js");

const MonsterService = require("../../services/monsterService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");

const CACHE_LIFETIME = 16 * Constants.MINUTE_IN_MILLIS;

const originalInteractions = {};

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
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const key = guildId + userId;

        const monsterId = interaction.options.getString("nome");
        const monster = MonsterService.get(monsterId, false);
        if (!monster) {
            await interaction.editReply("Nenhum mob encontrado!");
            return;
        }
        
        const embed = EmbededResponseService.getMonsterView(monster);

        originalInteractions[key] = interaction;
        setTimeout(() => delete originalInteractions[key], CACHE_LIFETIME);

        const dropsButton = new Discord.ButtonBuilder()
            .setLabel("Drops")
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId(`${guildId}:${userId}:queryMonsterCommand:showDrops:${monsterId}`);
        const actionRow = new Discord.ActionRowBuilder().addComponents(dropsButton);

        await interaction.editReply({
            embeds: [embed],
            files: [EmbededResponseService.FOOTER_IMAGE],
            components: [actionRow]
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
    },
    showDrops: async (interaction, guildId, memberId, monsterId) => {
        const key = guildId + memberId;

        const monster = MonsterService.get(monsterId);
        const embed = EmbededResponseService.getMonsterDropsView(monster);

        const gotoHomeButton = new Discord.ButtonBuilder()
            .setLabel("Voltar")
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId(`${guildId}:${memberId}:queryMonsterCommand:gotoHome:${monsterId}`);
        const actionRow = new Discord.ActionRowBuilder().addComponents(gotoHomeButton);

        await Promise.all([
            originalInteractions[key]?.editReply({
                embeds: [embed],
                components: [actionRow]
            }),
            interaction.deferUpdate()
        ]);
    },
    gotoHome: async (interaction, guildId, memberId, monsterId) => {
        const key = guildId + memberId;

        const monster = MonsterService.get(monsterId, false);
        const embed = EmbededResponseService.getMonsterView(monster);

        const dropsButton = new Discord.ButtonBuilder()
            .setLabel("Drops")
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId(`${guildId}:${memberId}:queryMonsterCommand:showDrops:${monsterId}`);
        const actionRow = new Discord.ActionRowBuilder().addComponents(dropsButton);

        await Promise.all([
            originalInteractions[key]?.editReply({
                embeds: [embed],
                components: [actionRow]
            }),
            interaction.deferUpdate()
        ]);
    }
}
