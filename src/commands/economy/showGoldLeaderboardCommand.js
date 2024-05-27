const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const StatusService = require("./../../services/statusService");

const buildActionRow = (guildId, memberId) => {
    const previousButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showGoldLeaderboardCommand:previousPage`)
        .setLabel("Anterior")
        .setStyle(Discord.ButtonStyle.Secondary);

    const nextButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showGoldLeaderboardCommand:nextPage`)
        .setLabel("Próximo")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(previousButton, nextButton);
}

const pages = {};
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placargold")
        .setDescription("Mostra o placar atual de GOLD dos usuários"),
    async execute(interaction) {
        try {
            if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
                await interaction.editReply("Você não possui cargo de ADM para executar o comando.");
                return;
            };

            if (Object.keys(pages).length > 3) {
                pages = {};
            }

            const guildId = interaction.guild.id;
            const memberId = interaction.member.id;

            const leaderboard = await StatusService.getGoldLeaderboard(guildId, 0);
            const actionRow = buildActionRow(guildId, memberId);
    
            const message = await interaction.editReply({
                content: leaderboard,
                components: [actionRow]
            });

            pages[message.id] = 0;
        } catch(err) {
            await interaction.editReply(err.message);
        }
    },
    previousPage: async (interaction, guildId, memberId) => {
        const messageId = interaction.message.id;

        const currentPage = pages[messageId] || 1;
        const newPage = currentPage - 1;

        pages[messageId] = newPage;
        const leaderboard = await StatusService.getGoldLeaderboard(guildId, newPage);
        interaction.message.edit(leaderboard);

        await interaction.deferUpdate();
    },
    nextPage: async (interaction, guildId, memberId) => {
        const messageId = interaction.message.id;
        console.log(pages, messageId);
        
        const currentPage = pages[messageId] || 0;
        const newPage = currentPage + 1;
        
        const leaderboard = await StatusService.getGoldLeaderboard(guildId, newPage);
        if (leaderboard.split("\n").length >= 5) {
            pages[interaction.message.id] = newPage;
            interaction.message.edit(leaderboard);
        }
        
        await interaction.deferUpdate();
    }
}

