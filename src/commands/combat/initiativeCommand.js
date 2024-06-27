const Discord = require("discord.js");
const { randomId } = require("../../utils");
const EmbededResponseService = require("../../services/embededResponseService");

const Logger = require("../../logger");
const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const combats = {};

const data = new Discord.SlashCommandBuilder()
    .setName("iniciativa")
    .setDescription("Adiciona jogadores para teste de iniciativa");

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

const buildActionRow = (guildId, userId, combatId) => {
    const addMobbutton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:initiativeCommand:addMobModal:${combatId}`)
        .setLabel("Adicionar Mob")
        .setStyle(Discord.ButtonStyle.Success);

    return new Discord.ActionRowBuilder().addComponents(addMobbutton);
}

module.exports = {
    data,
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const { users } = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);
        const combatId = randomId(10);
        
        users[0].selected = true;
        combats[combatId] = {
            participants: users
        };
        
        const embed = EmbededResponseService.getInitiativeView(users.sort((a, b) => b.stats.baseInitiative - a.stats.baseInitiative), []);

        await interaction.editReply({
            embeds: [embed],
            components: [buildActionRow(guildId, userId, combatId)]
        });
    },
    addMobModal: async (interaction, guildId, memberId, combatId) => {
        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:initiativeCommand:addMob:${combatId}`)
			.setTitle("Novo mob");
        
        const inputs = [
            new Discord.TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nome")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
        ];

        const actionRows = [];
        for (let input of inputs) {
            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            actionRows.push(actionRow);
        }

        modal.addComponents(actionRows);

        await interaction.showModal(modal);
    },
    addMob: async (interaction, guildId, memberId, combatId) => {
        const name = interaction.fields.getTextInputValue("name");

        const monster = {
            playerName: name,
            stats: {
                currentHP: 0,
                maxHP: 0,
                tempHP: 0,
                currentFP: 0,
                maxFP: 0,
                tempFP: 0,
                baseDEF: 0
            }
        };

        combats[combatId].participants.push(monster);

        const embed = EmbededResponseService.getInitiativeView(combats[combatId].participants, []);
        interaction.message.edit({ embeds: [embed] });

        await interaction.deferUpdate();
    }
}