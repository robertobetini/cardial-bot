const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const StatusService = require("../../services/statusService");
const AttributesService = require("../../services/attributesService");
const StatsService = require("../../services/statsService");

const Attributes = require("../../models/attributes");

const buildActionRow = (guildId, memberId) => {
    const statusButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showStatsModal`)
        .setLabel("Status")
        .setStyle(Discord.ButtonStyle.Secondary);

    const attributesButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showAttributesModal`)
        .setLabel("Atributos")
        .setStyle(Discord.ButtonStyle.Secondary);

    const skillsButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:skills`)
        .setLabel("Perícias")
        .setStyle(Discord.ButtonStyle.Secondary);

    const characterButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showCharacterModal`)
        .setLabel("Personagem")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(statusButton, attributesButton, skillsButton, characterButton);
}

const createAttributeButton = (attribute, defaultValue) => {
    return new Discord.TextInputBuilder()
        .setCustomId(attribute)
        .setLabel(attribute)
        .setStyle(Discord.TextInputStyle.Short)
        .setValue(defaultValue)
        .setPlaceholder("Min: 0, Max: 999")
        .setMaxLength(3)
        .setMinLength(1)
        .setRequired(true);
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("ficha")
        .setDescription("Mostra informações de status, atributos, perícias, etc do usuário selecionado")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser("user") || interaction.user;

        const guildId = interaction.guild.id;

        if (target.id !== interaction.user.id && !await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("É necessário cargo de ADM para consultar o status de outros usuários.");
        }

        const status = await StatusService.getUserStatus(guildId, target);

        const actionRow = buildActionRow(guildId, target.id);

        await interaction.editReply({
            content: status,
            components: [actionRow]
        });
    },
    showAttributesModal: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const attributes = await AttributesService.get(guildId, memberId);

        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:showUserStatusCommand:updateAttributes`)
			.setTitle("Atributos");

        const inputs = [
            createAttributeButton("FOR", attributes.FOR.toString()),
            createAttributeButton("DEX", attributes.DEX.toString()),
            createAttributeButton("CON", attributes.CON.toString()),
            createAttributeButton("WIS", attributes.WIS.toString()),
            createAttributeButton("CHA", attributes.CHA.toString())
        ];

        const actionRows = [];
        for (let input of inputs) {
            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            actionRows.push(actionRow);
        }

        modal.addComponents(actionRows);

        await interaction.showModal(modal);
    },
    updateAttributes: async (interaction, guildId, memberId) => {
        const $for = Number(interaction.fields.getTextInputValue("FOR"));
        const dex = Number(interaction.fields.getTextInputValue("DEX"));
        const con = Number(interaction.fields.getTextInputValue("CON"));
        const wis = Number(interaction.fields.getTextInputValue("WIS"));
        const cha = Number(interaction.fields.getTextInputValue("CHA"));
        
        for (let attribute of [ $for, dex, con, wis, cha ]) {
            if (isNaN(attribute) || attribute < 0) {
                await interaction.reply("Erro ao salvar atributos.");
                return;     
            }
        }

        const attributes = new Attributes(memberId, guildId, $for, dex, con, wis, cha);
        await AttributesService.update(attributes);

        await interaction.deferUpdate();
    },
    showCharacterModal: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const user = await StatsService.getUserStats(memberId, guildId);

        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:showUserStatusCommand:updateCharacter`)
			.setTitle("Status de personagem");

        const inputs = [
            new Discord.TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nome")
                .setStyle(Discord.TextInputStyle.Short)
                .setValue(user.playerName || "Nome")
                .setPlaceholder("Ex: Geralt of Rivia, Andrezitos, x-ae-12")
                .setMaxLength(32)
                .setMinLength(1)
                .setRequired(true),
            new Discord.TextInputBuilder()
                .setCustomId("job")
                .setLabel("Profissão")
                .setStyle(Discord.TextInputStyle.Short)
                .setValue(user.job || "Profissão")
                .setPlaceholder("Ex: Lenhador, Cozinheiro, Armeiro")
                .setMaxLength(32)
                .setMinLength(1)
                .setRequired(true),
        ];
        
        const actionRows = [];
        for (let input of inputs) {
            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            actionRows.push(actionRow);
        }

        modal.addComponents(actionRows);

        await interaction.showModal(modal);
    }
}
