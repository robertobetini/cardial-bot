const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EmbededResponseService = require("./../../services/embededResponseService");

const Cache = require("../../cache");
const Constants = require("../../constants");

const buildActionRow = (guildId, memberId, command, type) => {
    const previousButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:${command}:previousPage:${type}`)
        .setLabel("Anterior")
        .setStyle(Discord.ButtonStyle.Secondary);

    const nextButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:${command}:nextPage:${type}`)
        .setLabel("Próximo")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(previousButton, nextButton);
}

const CACHE_LIFETIME = 5 * Constants.MINUTE_IN_MILLIS;
const pages = new Cache(CACHE_LIFETIME);

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placar")
        .setDescription("Mostra os placares dos usuários")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("Tipo de placar a ser exibido")
                .setRequired(true)
                .addChoices(
                    { name: "Gold", value: "Gold" },
                    { name: "Level", value: "Level" },
                    { name: "R.Arma", value: "Arma" }
                )
        ),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
    
        const guildId = interaction.guild.id;
        const memberId = interaction.member.id;
        const type = interaction.options.getString("tipo");
        const command = "showLeaderboardsCommand";
    
        let leaderboard;
        if (type === "Gold") {
            [leaderboard, _] = EmbededResponseService.getGoldLeaderboard(guildId, 0);
        } else if (type === "Level") {
            [leaderboard, _] = EmbededResponseService.getExpLeaderboard(guildId, 0);
        } else if(type === "Arma") {
            [leaderboard, _] = EmbededResponseService.getArmaLeaderboard(guildId, 0);
        }
    
        const actionRow = buildActionRow(guildId, memberId, command, type);
    
        // Verifique se a interação já foi respondida ou adiada
        if (!interaction.replied && !interaction.deferred) {
            await interaction.deferReply(); // Adie a resposta
        }

        const message = await interaction.editReply({
            content: "",
            embeds: [leaderboard],
            components: [actionRow],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });

        pages.set(message.id, 0);
        return message;
    },
    previousPage: async (interaction, guildId, memberId, type) => {
        await interaction.deferUpdate();

        const messageId = interaction.message.id;
        const currentPage = pages.get(messageId) || 0;
        const newPage = currentPage - 1;
    
        if (newPage < 0) {
            return;
        }
    
        pages.set(messageId, newPage);
    
        let leaderboard;
        if (type === "Gold") {
            [leaderboard, _] = EmbededResponseService.getGoldLeaderboard(guildId, newPage);
        } else if (type === "Level") {
            [leaderboard, _] = EmbededResponseService.getExpLeaderboard(guildId, newPage);
        } else if (type === "Arma") {
            [leaderboard, _] = EmbededResponseService.getArmaLeaderboard(guildId, newPage);
        }
    
        await interaction.editReply({ embeds: [leaderboard] });
    },
    nextPage: async (interaction, guildId, memberId, type) => {
        await interaction.deferUpdate();

        const messageId = interaction.message.id;
        const currentPage = pages.get(messageId) || 0;
        const newPage = currentPage + 1;
    
        let leaderboard, isEmpty;
        if (type === "Gold") {
            [leaderboard, isEmpty] = EmbededResponseService.getGoldLeaderboard(guildId, newPage);
        } else if (type === "Level") {
            [leaderboard, isEmpty] = EmbededResponseService.getExpLeaderboard(guildId, newPage);
        } else if (type === "Arma") {
            [leaderboard, isEmpty] = EmbededResponseService.getArmaLeaderboard(guildId, newPage);
        }
    
        if (isEmpty) {
            return;  
        }

        pages.set(interaction.message.id, newPage);

        await interaction.editReply({ embeds: [leaderboard] });
    }
};
