const Discord = require("discord.js");
const RoleService = require("../../services/roleService");
const EmbededResponseService = require("../../services/embededResponseService");

const buildActionRow = (guildId, memberId) => {
    const previousButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showLevelLeaderboardCommand:previousPage`)
        .setLabel("Anterior")
        .setStyle(Discord.ButtonStyle.Secondary);

    const nextButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showLevelLeaderboardCommand:nextPage`)
        .setLabel("Próximo")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(previousButton, nextButton);
}

let pages = {};
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placarnivel")
        .setDescription("Mostra o placar atual de níveis dos usuários"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);;
        
        if (Object.keys(pages).length > 3) {
            pages = {};
        }
        
        const guildId = interaction.guild.id;
        const memberId = interaction.member.id;

        const [leaderboard, _] = EmbededResponseService.getExpLeaderboard(guildId, 0);
        const actionRow = buildActionRow(guildId, memberId);

        const message = await interaction.editReply({
            content: "",
            embeds: [leaderboard],
            components: [actionRow],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });

        pages[message.id] = 0;
    },
    previousPage: async (interaction, guildId, memberId) => {
        const messageId = interaction.message.id;

        const currentPage = pages[messageId] || 0;
        const newPage = currentPage - 1;
        if (newPage < 0) {
            await interaction.deferUpdate();
            return;
        }

        pages[messageId] = newPage;
        const [leaderboard, _] = EmbededResponseService.getExpLeaderboard(guildId, newPage);
        
        await Promise.all([
            interaction.message.edit({ embeds: [leaderboard] }),
            interaction.deferUpdate()
        ]);
    },
    nextPage: async (interaction, guildId, memberId) => {
        const messageId = interaction.message.id;
        
        const currentPage = pages[messageId] || 0;
        const newPage = currentPage + 1;
        
        const [leaderboard, isEmpty] = EmbededResponseService.getExpLeaderboard(guildId, newPage);
        const promises = [interaction.deferUpdate()];
        if (!isEmpty) {
            pages[interaction.message.id] = newPage;
            promises.push(interaction.message.edit({ embeds: [leaderboard] }));
        }
        
        await Promise.all(promises);
    }
}
