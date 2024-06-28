const Discord = require("discord.js");
const { randomId } = require("../../utils");

const EmbededResponseService = require("../../services/embededResponseService");
const RoleService = require("../../services/roleService");

const Logger = require("../../logger");
const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const combats = {};
const CACHE_LIFETIME = 16 * Constants.MINUTE_IN_MILLIS;

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
        
        combats[combatId] = {
            participants: users,
            enemies: []
        };
        setTimeout(() => delete combats[combatId], CACHE_LIFETIME);
        
        users.sort((a, b) => -1);
        users[0].selected = true;
        const embed = EmbededResponseService.getInitiativeView(users, combats[combatId].enemies);

        await interaction.editReply({
            embeds: [embed],
            components: [buildActionRow(guildId, userId, combatId)]
        });
    },
    addMobModal: async (interaction, guildId, memberId, combatId) => {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member, true);

        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:initiativeCommand:addMob:${combatId}`)
			.setTitle("Novo mob");
        
        const inputs = [
            new Discord.TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nome")
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(Constants.MOBILE_LINE_SIZE)
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
                baseDEF: 0,
                baseInitiative: 0
            }
        };

        combats[combatId].enemies.push(monster);

        const embed = EmbededResponseService.getInitiativeView(combats[combatId].participants.sort((a, b) => -1), combats[combatId].enemies);
        interaction.message.edit({ embeds: [embed] });

        await interaction.deferUpdate();
    }
}