const Discord = require("discord.js");
const { randomId, setCombatOrder } = require("../../utils");

const EmbededResponseService = require("../../services/embededResponseService");
const RoleService = require("../../services/roleService");
const StatsService = require("../../services/statsService");

const Logger = require("../../logger");
const Cache = require("../../cache");
const Constants = require("../../constants");
const { addMultipleUserOptions, getUsersFromInput } = require ("../helpers");

const CACHE_LIFETIME = Constants.INTERACTION_COLLECTOR_LIFETIME_IN_HOURS * Constants.HOUR_IN_MILLIS;
const combats_cache = new Cache(CACHE_LIFETIME);

const data = new Discord.SlashCommandBuilder()
    .setName("iniciativa")
    .setDescription("Adiciona jogadores para teste de iniciativa");

addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 1);

const buildActionRows = (guildId, userId, combatId, blockButtons = false) => {
    const { participants, mobs } = combats_cache.get(combatId);
    const actionRows = [];

    const addMobButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:initiativeCommand:addMobModal:${combatId}`)
        .setLabel("Adicionar Mob")
        .setStyle(Discord.ButtonStyle.Success)
        .setDisabled(blockButtons);
    
    const setNextPlayerButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:initiativeCommand:setNextPlayer:${combatId}`)
        .setLabel("Próximo")
        .setStyle(Discord.ButtonStyle.Secondary)
        .setDisabled(blockButtons);

    actionRows.push(new Discord.ActionRowBuilder().addComponents(addMobButton, setNextPlayerButton))

    if (!blockButtons) {
        const select = new Discord.StringSelectMenuBuilder()
            .setCustomId(`${guildId}:${userId}:initiativeCommand:removeEntity:${combatId}`)
            .setPlaceholder("Remover")
            .setOptions(
                ...participants.map(({ playerName, userId }) => new Discord.StringSelectMenuOptionBuilder().setLabel(playerName).setValue(userId)),
                ...mobs.map(({ name }) => new Discord.StringSelectMenuOptionBuilder().setLabel(name).setValue(name))
            );
        
        actionRows.push(new Discord.ActionRowBuilder().addComponents(select));
    } 

    return actionRows;
}

module.exports = {
    data,
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const { users } = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS);
        const combatId = randomId(10);

        const combat = combats_cache.set(combatId, { participants: users, mobs: [], gm: null });
        
        users.sort((a, b) => setCombatOrder(a, b));
        users[0].selected = true;
        
        const embed = EmbededResponseService.getInitiativeView(users, combat.mobs);
        return await interaction.editReply({
            content: `Turno de ${Discord.userMention(users[0].userId)}`,
            embeds: [embed],
            components: buildActionRows(guildId, userId, combatId),
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    addMobModal: async (interaction, guildId, memberId, combatId) => {
        if (!combats_cache.get(combatId)) {
            return;
        }

        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);

        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:initiativeCommand:addMob:${combatId}`)
			.setTitle("Novo mob");
        
        const inputs = [
            new Discord.TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nome")
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(Constants.MOBILE_LINE_SIZE)
                .setRequired(true),
            new Discord.TextInputBuilder()
                .setCustomId("quantity")
                .setLabel("Quantidade")
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(1)
                .setMinLength(1)
                .setPlaceholder("Quantidade de 1 a 9")
                .setValue("1")
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
        await interaction.deferUpdate();
        const combat = combats_cache.get(combatId);
        if (!combat) {
            return;
        }

        const mobName = interaction.fields.getTextInputValue("name");
        const quantity = parseInt(interaction.fields.getTextInputValue("quantity"));
        if (quantity === 0) {
            return;
        }

        const isMobTurn = combat.mobs.filter(mob => mob.selected).length > 0;
        if (quantity === 1) {
            combat.mobs.push({ name: mobName, selected: isMobTurn });
        } else {
            for (let i = 0; i < quantity; i++) {
                combat.mobs.push({ name: mobName + ` ${i+1}`, selected: isMobTurn });
            }
        }
        combat.gm = interaction.member.id;

        const embed = EmbededResponseService.getInitiativeView(combat.participants, combat.mobs);
        await interaction.message.edit({ 
            embeds: [embed],
            components: buildActionRows(guildId, memberId, combatId)
        });
    },
    setNextPlayer: async (interaction, guildId, memberId, combatId) => {
        await interaction.deferReply();
        const combat = combats_cache.get(combatId);
        if (!combat) {
            return;
        }

        const { participants, mobs, gm } = combat;

        const selectedIndex = participants.findIndex(p => p.selected);
        const lastIndex = participants.length - 1;
        let mention = Discord.userMention();
        if (selectedIndex < 0) {
            // scenario: it's mob turn, so next turn should be the first player

            mobs.forEach(enemy => enemy.selected = false);
            participants[0].selected = true;
            mention = Discord.userMention(participants[0].userId);
        } else if(selectedIndex < lastIndex) {
            // scenario: it's player turn, and the next turn is also a player

            const nextIndex = (selectedIndex + 1) % participants.length;
            participants[selectedIndex].selected = false;
            participants[nextIndex].selected = true;
            mention = Discord.userMention(participants[nextIndex].userId);
        } else {
            // scenario: it's the last player turn, so either will be mob turn, if there is any, or the first player again

            participants[lastIndex].selected = false;
            if (mobs.length > 0 ) {
                mobs.forEach(enemy => enemy.selected = true);
                mention = Discord.userMention(gm);
            } else {
                participants[0].selected = true;
                mention = Discord.userMention(participants[0].userId);
            }
        }

        for (const user of participants) {
            user.stats = StatsService.get(user.userId, guildId);
        }
        
        const embed = EmbededResponseService.getInitiativeView(participants, mobs);
        try {
            const [_, message] = await Promise.all([
                interaction.message.delete(),
                interaction.editReply({ 
                    content: `Turno de ${mention}`, 
                    embeds: [embed],
                    components: interaction.message.components
                })
            ]);

            return message;
        } catch {
            Logger.warn("Tried to delete non-existing interaction message");
        }
    },
    removeEntity: async (interaction, guildId, memberId, combatId) => {
        await interaction.deferUpdate();
        const combat = combats_cache.get(combatId);
        if (!combat) {
            return;
        }

        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);

        const selectedEntity = interaction.values[0];
        const { participants, mobs } = combat;

        let selectedIndex = participants.findIndex(p => p.userId === selectedEntity);
        if (selectedIndex < 0) {
            selectedIndex = mobs.findIndex(m => m.name != selectedEntity);
        }

        combat.participants = participants.filter(p => p.userId != selectedEntity);
        combat.mobs = mobs.filter(m => m.name != selectedEntity);

        const embed = EmbededResponseService.getInitiativeView(combat.participants, combat.mobs);
        const mustBlockButtons = combat.participants.length < 1;

        await Promise.all([
            interaction.message.edit({ 
                embeds: [embed],
                components: buildActionRows(guildId, memberId, combatId, mustBlockButtons)
            })
        ]);
    }
}
