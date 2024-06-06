const Discord = require("discord.js");

const userDAO = require("../../DAOs/userDAO");

const RoleService = require("../../services/roleService");
const EmbededResponseService = require("../../services/embededResponseService");
const AttributesService = require("../../services/attributesService");
const StatsService = require("../../services/statsService");

const Attributes = require("../../models/attributes");
const SkillsService = require("../../services/skillService");

const Constants = require("../../constants");

const buildHomeActionRow = (guildId, memberId) => {
    const statusButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showStatsRow`)
        .setLabel("Status")
        .setStyle(Discord.ButtonStyle.Primary);

    const attributesButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showAttributesModal`)
        .setLabel("Atributos")
        .setStyle(Discord.ButtonStyle.Primary);

    const skillsButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showSkillsRow`)
        .setLabel("Perícias")
        .setStyle(Discord.ButtonStyle.Primary);

    const characterButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showCharacterModal`)
        .setLabel("Personagem")
        .setStyle(Discord.ButtonStyle.Primary);

    return new Discord.ActionRowBuilder().addComponents(statusButton, attributesButton, skillsButton, characterButton);
}

const buildStatsActionRows = (guildId, userId, selected) => {
    const statsSelect = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:selectStat`)
        .setPlaceholder("Selecione um status")
        .setOptions(createSelectOptions(Constants.stats, selected));

    const gotoHomeButton = createGotoHomeButton(guildId, userId);

    return [
        new Discord.ActionRowBuilder().addComponents(statsSelect),
        new Discord.ActionRowBuilder().addComponents(gotoHomeButton)
    ];
}

const buildSelectedStatActionRows = (guildId, userId, selected) => {
    let actionRows = buildStatsActionRows(guildId, userId, selected);

    const updateButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:showUpdateStatModal:${selected}`)
        .setLabel("Atualizar")
        .setStyle(Discord.ButtonStyle.Success);

    actionRows[1] = actionRows[1].addComponents(updateButton);

    return actionRows;
}

const buildSkillsActionRow = async (guildId, userId, selected) => {
    const skillsSelect = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:selectSkill`)
        .setPlaceholder("Selecione uma perícia")
        .setOptions(createSelectOptions(Constants.skills, selected));

    const skills = await SkillsService.get(userId, guildId);

    const skillValuesSelect = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:updateSkillLevel`)
        .setPlaceholder("Selecione um nível de proficiência")
        .setOptions(createSelectOptions(Constants.possibleSkillValues, skills[selected]));

    const gotoHomeButton = createGotoHomeButton(guildId, userId);

    return [
        new Discord.ActionRowBuilder().addComponents(skillsSelect),
        new Discord.ActionRowBuilder().addComponents(skillValuesSelect),
        new Discord.ActionRowBuilder().addComponents(gotoHomeButton)
    ];
}

const buildSelectedSkillActionRows = async (guildId, userId, selected) => {
    let actionRows = await buildSkillsActionRow(guildId, userId, selected);

    const updateButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:updateSkill:${selected}`)
        .setLabel("Atualizar")
        .setStyle(Discord.ButtonStyle.Success);

    actionRows[2] = actionRows[2].addComponents(updateButton);

    return actionRows;
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

const createSelectOptions = (optionList, selected) => {
    const options = [];
    for (let item of optionList) {
        let option = new Discord.StringSelectMenuOptionBuilder()
            .setLabel(item.label)
            .setValue(item.value);
        
        if (item.value == selected) {
            option.setDefault(true);
        }

        options.push(option);
    }

    return options;
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
                placeholder = "Ex: Geralt of Rivia, Andrezitos, x-ae-a-12",
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

        const actionRows = buildStatsActionRows(guildId, memberId);
        interaction.message.edit({ components: actionRows });

        await interaction.deferUpdate();
    },
    showSkillsRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const actionRows = await buildSkillsActionRow(guildId, memberId);
        interaction.message.edit({ components: actionRows });

        await interaction.deferUpdate();
    },
    selectStat: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const selectedStat = interaction.values[0];
        const actionRows = buildSelectedStatActionRows(guildId, memberId, selectedStat);
        
        interaction.message.edit({ components: actionRows });

        await interaction.deferUpdate();
    },
    showUpdateStatModal: async (interaction, guildId, memberId, selectedStat) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const stats = await StatsService.get(memberId, guildId);
        
        const modal = new Discord.ModalBuilder()
			.setCustomId(`${guildId}:${memberId}:showUserStatusCommand:updateStats:${selectedStat}`)
			.setTitle("Atualização de status");

        const input = createTextInput(
            "newValue", 
            "Novo Valor", 
            Discord.TextInputStyle.Short, 
            required = true,
            defaultValue = stats[selectedStat].toString(),
            placeholder = "Min: 0, Max: 999",
            minLength = 1,
            maxLength = 3
        );
        const actionRow = new Discord.ActionRowBuilder().addComponents(input);

        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    },
    updateStats: async (interaction, guildId, memberId, selectedStat) => {
        const newValue = Number(interaction.fields.getTextInputValue("newValue"));
        
        if (isNaN(newValue) || newValue < 0) {
            await interaction.deferUpdate();
            return;
        }

        await StatsService.updateSingleStat(memberId, guildId, selectedStat, newValue);

        const embed = await EmbededResponseService.getUserStatus(guildId, interaction.user);
        interaction.message.edit({ embeds: [embed] });

        await interaction.deferUpdate();
    },
    selectSkill: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        console.log(interaction.values);
        const selectedSkill = interaction.values[0];
        const actionRows = await buildSelectedSkillActionRows(guildId, memberId, selectedSkill);

        interaction.message.edit({ components: actionRows });

        await interaction.deferUpdate();
    },
    updateSkill: async (interaction, guildId, memberId, selectedSkill) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const skillValueOptions = interaction.message.components[1].components[0].data.options;
        const newSkillLevel = skillValueOptions.find(opt => opt.default).value;
        console.log(selectedSkill, newSkillLevel);
        console.log(skillValueOptions);

        await SkillsService.updateSingleSkill(memberId, guildId, selectedSkill, newSkillLevel);

        await interaction.deferUpdate();
    },
    updateSkillLevel: async (interaction, guildId, memberId, selectedSkill) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const skillLevel = interaction.values[0];

        const defaultOption = interaction.message.components[1].components[0].data.options.find(opt => opt.default);
        if (defaultOption) {
            defaultOption.default = false;
        }

        const selectedOption = interaction.message.components[1].components[0].data.options.find(opt => opt.value == skillLevel);
        if (selectedOption) {
            selectedOption.default = true;
        }
        
        interaction.message.edit({ components: interaction.message.components });

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
