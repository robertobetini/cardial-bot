const Discord = require("discord.js");
const RoleService = require("./../../services/roleService");
const EmbededResponseService = require("./../../services/embededResponseService");

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

const pages = {};
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
    
        if (Object.keys(pages).length > 3) {
            // Limpe o conteúdo em vez de reatribuir
            Object.keys(pages).forEach(key => delete pages[key]);
        }
    
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
    
        try {
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
    
            pages[message.id] = 0;
        } catch (error) {
            console.error("Error handling interaction:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "Ocorreu um erro ao processar seu pedido.", ephemeral: true });
            } else {
                await interaction.reply({ content: "Ocorreu um erro ao processar seu pedido.", ephemeral: true });
            }
        }
    },
    async handleButtonInteraction(interaction) {
        if (!interaction.isButton()) return;

        const [guildId, memberId, command, action, type] = interaction.customId.split(':');

        if (command !== 'showLeaderboardsCommand') return;

        if (action === 'previousPage') {
            await this.previousPage(interaction, guildId, memberId, type);
        } else if (action === 'nextPage') {
            await this.nextPage(interaction, guildId, memberId, type);
        }
    },
    previousPage: async (interaction, guildId, memberId, type) => {
        const messageId = interaction.message.id;
        const currentPage = pages[messageId] || 0;
        const newPage = currentPage - 1;
    
        if (newPage < 0) {
            await interaction.deferUpdate();
            return;
        }
    
        pages[messageId] = newPage;
    
        let leaderboard;
        if (type === "Gold") {
            [leaderboard, _] = EmbededResponseService.getGoldLeaderboard(guildId, newPage);
        } else if (type === "Level") {
            [leaderboard, _] = EmbededResponseService.getExpLeaderboard(guildId, newPage);
        } else if (type === "Arma") {
            [leaderboard, _] = EmbededResponseService.getArmaLeaderboard(guildId, newPage);
        }
    
        try {
            await Promise.all([
                interaction.message.edit({ embeds: [leaderboard] }),
                interaction.deferUpdate()
            ]);
        } catch (error) {
            console.error("Error updating message:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: "Erro ao atualizar o placar.", ephemeral: true });
            }
        }
    },
    
    nextPage: async (interaction, guildId, memberId, type) => {
        const messageId = interaction.message.id;
        const currentPage = pages[messageId] || 0;
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
            await interaction.deferUpdate();
        } else {
            pages[interaction.message.id] = newPage;
            try {
                await interaction.update({ embeds: [leaderboard] });
            } catch (error) {
                console.error("Error updating message:", error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: "Erro ao atualizar o placar.", ephemeral: true });
                }
            }
        }
    }
};
