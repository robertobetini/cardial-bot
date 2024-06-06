const Discord = require("discord.js");

const userDAO = require("../../DAOs/userDAO");

const RoleService = require("../../services/roleService");
const EmbededResponseService = require("../../services/embededResponseService");
const AttributesService = require("../../services/attributesService");
const StatsService = require("../../services/statsService");

const Attributes = require("../../models/attributes");

const buildHomeActionRow = (guildId, memberId) => {
    const statusButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showStatsRow`)
        .setLabel("Status")
        .setStyle(Discord.ButtonStyle.Secondary);

    const attributesButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showAttributesModal`)
        .setLabel("Atributos")
        .setStyle(Discord.ButtonStyle.Secondary);

    const skillsButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showSkillsRow`)
        .setLabel("Perícias")
        .setStyle(Discord.ButtonStyle.Secondary);

    const characterButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showCharacterModal`)
        .setLabel("Personagem")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(statusButton, attributesButton, skillsButton, characterButton);
}

const buildStatsActionRow = (guildId, userId, stats) => {
    const gotoHomeButton = createGotoHomeButton(guildId, userId);

    return new Discord.ActionRowBuilder().addComponents(gotoHomeButton);
}

const buildSkillsActionRow = (guildId, userId, skills) => {
    const gotoHomeButton = createGotoHomeButton(guildId, userId);

    return new Discord.ActionRowBuilder().addComponents(gotoHomeButton);
}

const createAttributeInput = (attribute, defaultValue) => {
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

const createTextInput = (customId, label, style, required = false, defaultValue = null, placeholder = null, minLength = null, maxLength = null) => {
    let input = new Discord.TextInputBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setRequired(required);

    input = defaultValue ? input.setValue(defaultValue)      : input;
    input = placeholder  ? input.setPlaceholder(placeholder) : input;
    input = minLength    ? input.setMinLength(minLength)     : input;
    input = maxLength    ? input.setMaxLength(maxLength)     : input;
    
    return input;
}

const createGotoHomeButton = (guildId, userId) => {
    return new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:gotoHomeRow`)
        .setLabel("Voltar")
        .setStyle(Discord.ButtonStyle.Secondary);
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

        const embed = await EmbededResponseService.getUserStatus(guildId, target);

        const actionRow = buildHomeActionRow(guildId, target.id);

        await interaction.editReply({
            content: "",
            embeds: [embed],
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
            createAttributeInput("FOR", attributes.FOR.toString()),
            createAttributeInput("DEX", attributes.DEX.toString()),
            createAttributeInput("CON", attributes.CON.toString()),
            createAttributeInput("WIS", attributes.WIS.toString()),
            createAttributeInput("CHA", attributes.CHA.toString())
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
                await interaction.deferUpdate();
                return;
            }
        }

        const attributes = new Attributes(memberId, guildId, $for, dex, con, wis, cha);
        await AttributesService.update(attributes);

        const updatedEmbed = await EmbededResponseService.getUserStatus(guildId, interaction.member);
        interaction.message.edit({ 
            content: "",
            embeds: [updatedEmbed] 
        });

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
            createTextInput(
                "name", 
                "Nome", 
                Discord.TextInputStyle.Short, 
                required = true,
                defaultValue = user.playerName,
                placeholder = "Ex: Geralt of Rivia, Andrezitos, x-ae-12",
                minLength = 1,
                maxLength = 32
            ),
            createTextInput(
                "job", 
                "Profissão", 
                Discord.TextInputStyle.Short, 
                required = true,
                defaultValue = user.job,
                placeholder = "Ex: Lenhador, Cozinheiro, Armeiro",
                minLength = 1,
                maxLength = 32
            ),
            createTextInput(
                "notes", 
                "Notas", 
                Discord.TextInputStyle.Paragraph,
                required = false,
                defaultValue = user.notes,
                placeholder = "Notas sobre o personagem, características únicas, traços de personalidade, etc",
                minLength = null,
                maxLength = 1024
            )
        ];
        
        const actionRows = [];
        for (let input of inputs) {
            const actionRow = new Discord.ActionRowBuilder().addComponents(input);
            actionRows.push(actionRow);
        }

        modal.addComponents(actionRows);

        await interaction.showModal(modal);
    },
    updateCharacter: async (interaction, guildId, memberId) => {
        const name = interaction.fields.getTextInputValue("name");
        const job = interaction.fields.getTextInputValue("job");
        const notes = interaction.fields.getTextInputValue("notes");

        const user = await userDAO.get(memberId, guildId, false);

        user.playerName = name;
        user.job = job;
        user.notes = notes;

        await userDAO.update(user, false);

        const updatedEmbed = await EmbededResponseService.getUserStatus(guildId, interaction.member);
        interaction.message.edit({ 
            content: "",
            embeds: [updatedEmbed] 
        });

        await interaction.deferUpdate();
    },
    showStatsRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const stats = await StatsService.get(memberId, guildId);

        const actionRow = buildStatsActionRow(guildId, memberId, stats);
        interaction.message.edit({ components: [actionRow] });

        await interaction.deferUpdate();
    },

    showSkillsRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const actionRow = buildSkillsActionRow(guildId, memberId);
        interaction.message.edit({ components: [actionRow] });

        await interaction.deferUpdate();
    },
    gotoHomeRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const actionRow = buildHomeActionRow(guildId, memberId);
        interaction.message.edit({ components: [actionRow] });

        await interaction.deferUpdate();
    }
}
