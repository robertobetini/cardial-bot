const Discord = require("discord.js");
const { randomId } = require("../../utils");
const UserService = require("../../services/userService");
const EmbededResponseService = require("../../services/embededResponseService");

const Logger = require("../../logger");
const Constants = require("../../constants");

const combats = {};

const data = new Discord.SlashCommandBuilder()
    .setName("iniciativa")
    .setDescription("Adiciona jogadores para teste de iniciativa");

for (let i = 1; i <= Constants.INITIATIVE_COMMAND_MAX_USERS; i++) {
    data.addUserOption(option => 
        option
            .setName(`jogador${i}`)
            .setDescription(`Jogador ${i}`)
            .setRequired(i === 1)
    );
}

const parseDiceString = (dice) => {
    const result = /^(\d+)d(\d+)(\+\d*|-\d*)?$/.exec(dice);
    if (!result) {
        throw new Error("Invalid dice pattern");
    }

    console.log(result);

    const diceCount = result[1];
    const diceSides = result[2];
    const mod = Number(result[3] ?? 0);

    let total = 0;
    for (let i = 0; i < diceCount; i++) {
        total += Math.floor(Math.random() * diceSides + 1);
    }

    return total + mod;
} 

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
        const promises = [];

        for (let i = 1; i <= Constants.INITIATIVE_COMMAND_MAX_USERS; i++) {
            const user = interaction.options.getUser(`jogador${i}`);
            if (!user) {
                continue;
            }

            Logger.debug(`Adicionando jogador ${user.username} à busca de fichas`);
            promises.push(UserService.get(guildId, user.id, true));
        }

        const users = await Promise.all(promises);
        Logger.debug("Consulta de fichas realizada");

        if (users.findIndex(u => u == null || !u.attributes.firstAttributionDone) >= 0) {
            await interaction.editReply("Existem usuários sem ficha ou com ficha incompleta.");
            return;
        }

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
                .setRequired(true),
            new Discord.TextInputBuilder()
                .setCustomId("dice")
                .setLabel("Dado de iniciativa")
                .setPlaceholder("Ex.: 1d20+2")
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
        const dice = interaction.fields.getTextInputValue("dice");

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
                baseInitiative: parseDiceString(dice)
            }
        };

        combats[combatId].participants.push(monster);

        const embed = EmbededResponseService.getInitiativeView(combats[combatId].participants, []);
        interaction.message.edit({ embeds: [embed] });

        await interaction.deferUpdate();
    }
}