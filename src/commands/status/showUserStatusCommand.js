const Discord = require("discord.js");

const userDAO = require("../../DAOs/userDAO");

const RoleService = require("../../services/roleService");
const EmbededResponseService = require("../../services/embededResponseService");
const AttributesService = require("../../services/attributesService");
const StatsService = require("../../services/statsService");
const SkillsService = require("../../services/skillService");

const Attributes = require("../../models/attributes");

const Constants = require("../../constants");
const UserService = require("../../services/userService");
const Logger = require("../../logger");

const tempAttributes = {};
const originalInteractions = {};

const buildHomeActionRow = (guildId, memberId) => {
    const attributesButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:showUserStatusCommand:showAttributesRow`)
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

    return new Discord.ActionRowBuilder().addComponents(attributesButton, skillsButton, characterButton);
}

const buildAttributesActionRows = (guildId, userId, selected) => {
    const attributesSelect = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:selectAttribute`)
        .setPlaceholder("Selecione um atributo")
        .setOptions(createSelectOptions(Constants.attributes, selected));

    const gotoHomeButton = createGotoHomeButton(guildId, userId);

    return [
        new Discord.ActionRowBuilder().addComponents(attributesSelect),
        new Discord.ActionRowBuilder().addComponents(gotoHomeButton)
    ];
}

const buildSelectedAttributeActionRows = (guildId, userId, selected, buttonAvailability = [true, true, true, true]) => {
    let actionRows = buildAttributesActionRows(guildId, userId, selected);

    const cancelButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:clearTempAttributes`)
        .setLabel("Cancelar")
        .setStyle(Discord.ButtonStyle.Danger)
        .setDisabled(!buttonAvailability[0]);

    const decreaseButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:decreaseAttribute:${selected}`)
        .setLabel("-")
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(!buttonAvailability[1]);

    const increaseButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:increaseAttribute:${selected}`)
        .setLabel("+")
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(!buttonAvailability[2]);

    const confirmButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:saveTempAttributes`)
        .setLabel("Confirmar")
        .setStyle(Discord.ButtonStyle.Success)
        .setDisabled(!buttonAvailability[3]);

    actionRows[1] = actionRows[1].addComponents(cancelButton, decreaseButton, increaseButton, confirmButton);

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

const getAttributeButtonsAvailability = (guildId, memberId, selectedAttribute, currentAttributes = null) => {
    const key = guildId + memberId;
    if (!tempAttributes[key]) {
        return [false, false, false, false];
    }

    let cancelButtonEnabled = true;
    let decreaseButtonEnabled = true;
    let increaseButtonEnabled = true;
    let confirmButtonEnabled = false;

    const maxAttributeValue = tempAttributes[key].firstAttributionDone ? Constants.MAX_ATTRIBUTE_VALUE : Constants.MAX_ATTRIBUTE_VALUE_FOR_FIRST_TIME;
    if (tempAttributes[key][selectedAttribute] >= maxAttributeValue) {
        increaseButtonEnabled = false;
    }

    const minAttributeValue = currentAttributes ? currentAttributes[selectedAttribute] : Constants.MIN_ATTRIBUTE_VALUE;
    if (tempAttributes[key][selectedAttribute] <= minAttributeValue) {
        decreaseButtonEnabled = false;
    }
    if (tempAttributes[key].availablePoints < 1) {
        confirmButtonEnabled = true;
        increaseButtonEnabled = false;
    }

    return [ cancelButtonEnabled, decreaseButtonEnabled, increaseButtonEnabled, confirmButtonEnabled ];
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

const changeTempAttributesByAmount = async (guildId, memberId, selectedAttribute, amount) => {
    await createTempAttributeEntryIfNotExists(guildId, memberId);
    
    const key = guildId + memberId;
    tempAttributes[key][selectedAttribute] += amount;
    tempAttributes[key].availablePoints -= amount;
}

const createTempAttributeEntryIfNotExists = async (guildId, memberId) => {
    const key = guildId + memberId;
    const currentAttributes = await AttributesService.get(guildId, memberId);
    if (tempAttributes[key]) {
        return currentAttributes;
    }
    
    if (currentAttributes.availablePoints < 1) {
        return currentAttributes;
    }

    tempAttributes[key] = { currentAttributes };
    tempAttributes[key].FOR = currentAttributes.FOR;
    tempAttributes[key].DEX = currentAttributes.DEX;
    tempAttributes[key].CON = currentAttributes.CON;
    tempAttributes[key].WIS = currentAttributes.WIS;
    tempAttributes[key].CHA = currentAttributes.CHA;
    tempAttributes[key].availablePoints = currentAttributes.availablePoints;
    tempAttributes[key].firstAttributionDone = currentAttributes.firstAttributionDone;

    return currentAttributes;
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

        const key = guildId + target.id;
        const embed = await EmbededResponseService.getUserStatus(guildId, target, tempAttributes[key]);
        const actionRow = buildHomeActionRow(guildId, target.id);

        if (originalInteractions[key]) {
            try {
                await originalInteractions[key].deleteReply();
            } catch {
                Logger.warn("Tried to delet non-existing interaction message");
            }
        }
        originalInteractions[key] = interaction;

        await interaction.editReply({
            embeds: [embed],
            components: [actionRow]
        });
    },
    showAttributesRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const key = guildId + memberId;
        const actionRows = buildAttributesActionRows(guildId, memberId);
        
        originalInteractions[key]?.editReply({ components: actionRows });

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

        const inputs = [];
        if (!user.playerName) {
            inputs.push(
                createTextInput(
                    "name", 
                    "Nome", 
                    Discord.TextInputStyle.Short, 
                    required = false,
                    defaultValue = user.playerName,
                    placeholder = "Ex: Geralt of Rivia, Andrezitos, x-ae-a-12",
                    minLength = 1,
                    maxLength = 32,
                )
            );
        }

        inputs.push(
            createTextInput(
                "imgUrl", 
                "Imagem da thumbnail (URL)", 
                Discord.TextInputStyle.Short, 
                required = true,
                defaultValue = user.imgUrl,
                placeholder = null,
                minLength = 1,
                maxLength = 512
            )
        );
        inputs.push(
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
        );

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
        const imgUrl = interaction.fields.getTextInputValue("imgUrl");
        const notes = interaction.fields.getTextInputValue("notes");

        const user = await userDAO.get(memberId, guildId, false);

        if (name) {
            user.playerName = name;
        }
        user.imgUrl = imgUrl;
        user.notes = notes;

        await userDAO.update(user, false);

        const key = guildId + memberId;
        const updatedEmbed = await EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttributes[key]);
        originalInteractions[key]?.editReply({ embeds: [updatedEmbed] });

        await interaction.deferUpdate();
    },
    showSkillsRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const [embed, actionRows] = await Promise.all([
            EmbededResponseService.getUserSkills(guildId, memberId),
            buildSkillsActionRow(guildId, memberId)
        ]);

        const key = guildId + memberId;
        originalInteractions[key]?.editReply({
            embeds: [embed],
            components: actionRows 
        });

        await interaction.deferUpdate();
    },
    selectAttribute: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const selectedAttribute = interaction.values[0];
        const currentAttributes = await createTempAttributeEntryIfNotExists(guildId, memberId);

        let attributeButtonsAvailability = [false, false, false, false];
        if (!currentAttributes || currentAttributes.availablePoints > 0) {
            attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, currentAttributes);
        }
        const actionRows = buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability);
        
        const key = guildId + memberId;
        originalInteractions[key]?.editReply({ components: actionRows });

        await interaction.deferUpdate();
    },
    clearTempAttributes: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const key = guildId + memberId;
        delete tempAttributes[key];

        const updatedEmbed = await EmbededResponseService.getUserStatus(guildId, interaction.member);
        const actionRows = buildAttributesActionRows(guildId, memberId);
        originalInteractions[key]?.editReply({ 
            embeds: [updatedEmbed],
            components: actionRows 
        });

        await interaction.deferUpdate();
    },
    saveTempAttributes: async (interaction, guildId, memberId) => {
        const key = guildId + memberId;
        if (interaction.user.id != memberId || !tempAttributes[key] || tempAttributes[key].availablePoints > 0) {
            await interaction.deferUpdate();
            return;
        }

        const user = await UserService.get(guildId, memberId, false);
        if (!user.playerName) {
            await interaction.reply({ 
                content: "Você precisa escolher um nome para seu personagem antes de terminar a ficha!",
                ephemeral: true 
            });
            return;
        }

        const attributes = new Attributes(
            memberId, guildId, 
            tempAttributes[key].FOR, 
            tempAttributes[key].DEX, 
            tempAttributes[key].CON, 
            tempAttributes[key].WIS, 
            tempAttributes[key].CHA,
            tempAttributes[key].availablePoints,
            true
        );

        let propagateChangesToStats = true;
        if (!tempAttributes[key].firstAttributionDone) {
            await StatsService.setInitialStats(attributes);
            propagateChangesToStats = false;
            Logger.info(`User ${interaction.member.username} (${user.playerName}) finished first attributes pick up`);

            interaction.member.permissions.has('MANAGE_NICKNAMES') && memberId !== interaction.guild.ownerId
                ? interaction.member.setNickname(user.playerName)
                : await interaction.reply({ content: "Não consigo atualizar o seu nickname porque você é o dono do servidor ou tem um cargo maior do que o meu.", ephemeral: true });
        }

        await AttributesService.update(attributes, propagateChangesToStats);
        delete tempAttributes[key];

        const updatedEmbed = await EmbededResponseService.getUserStatus(guildId, interaction.member);
        const actionRows = buildAttributesActionRows(guildId, memberId);
        originalInteractions[key]?.editReply({ 
            embeds: [updatedEmbed],
            components: actionRows 
        });

        if (interaction.replied) {
            return;
        }
        await interaction.deferUpdate();
    },
    increaseAttribute: async (interaction, guildId, memberId, selectedAttribute) => {
        const key = guildId + memberId;
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        await changeTempAttributesByAmount(guildId, memberId, selectedAttribute, 1);
        
        const attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, tempAttributes[key].currentAttributes);
        originalInteractions[key]?.editReply({ 
            embeds: [ await EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttributes[key]) ],
            components: buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability)
        });

        await interaction.deferUpdate();
    },
    decreaseAttribute: async (interaction, guildId, memberId, selectedAttribute) => {
        const key = guildId + memberId;
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        await changeTempAttributesByAmount(guildId, memberId, selectedAttribute, -1);

        const attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, tempAttributes[key].currentAttributes);
        originalInteractions[key]?.editReply({ 
            embeds: [ await EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttributes[key]) ],
            components: buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability), 
        });

        await interaction.deferUpdate();
    },
    selectSkill: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const selectedSkill = interaction.values[0];
        const actionRows = await buildSelectedSkillActionRows(guildId, memberId, selectedSkill);

        const key = guildId + memberId;
        originalInteractions[key]?.editReply({ components: actionRows });

        await interaction.deferUpdate();
    },
    updateSkill: async (interaction, guildId, memberId, selectedSkill) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const skillValueOptions = interaction.message.components[1].components[0].data.options;
        const newSkillLevel = skillValueOptions.find(opt => opt.default).value;

        await SkillsService.updateSingleSkill(memberId, guildId, selectedSkill, newSkillLevel);
        const embed = await EmbededResponseService.getUserSkills(guildId, interaction.user);

        const key = guildId + memberId;
        originalInteractions[key]?.editReply({ embeds: [embed] });

        await interaction.deferUpdate();
    },
    updateSkillLevel: async (interaction, guildId, memberId) => {
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
        
        const key = guildId + memberId;
        originalInteractions[key]?.editReply({ components: interaction.message.components });

        await interaction.deferUpdate();
    },
    gotoHomeRow: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const key = guildId + memberId;
        const embed = await EmbededResponseService.getUserStatus(guildId, interaction.user, tempAttributes[key]);
        const actionRow = buildHomeActionRow(guildId, memberId);
        originalInteractions[key]?.editReply({ 
            embeds: [embed],
            components: [actionRow]
        });

        await interaction.deferUpdate();
    }
}
