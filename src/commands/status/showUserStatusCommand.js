const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const EmbededResponseService = require("../../services/embededResponseService");
const AttributesService = require("../../services/attributesService");
const StatsService = require("../../services/statsService");
const SkillsService = require("../../services/skillService");
const UserService = require("../../services/userService");

const Attributes = require("../../models/attributes");
const Skills = require("../../models/skills");

const Constants = require("../../constants");
const Cache = require("../../cache");
const Logger = require("../../logger");

const { isValidUrl } = require("../../utils");

const eventEmitter = require("../../events");

const CACHE_LIFETIME = Constants.INTERACTION_COLLECTOR_LIFETIME_IN_HOURS * Constants.HOUR_IN_MILLIS;
const tempAttributes = new Cache("USER_TEMP_ATTR_CACHE", CACHE_LIFETIME);
const originalInteractions = new Cache("USER_SHEETS_ORIGINAL_INTERACTION_CACHE", CACHE_LIFETIME);

const safeEditReply = async (interaction, reply) => {
    const key = interaction.guild.id + interaction.member.id;

    try {
        return await originalInteractions.get(key)?.editReply(reply);
    } catch (err) {
        Logger.warn(`Sending new reply due to error when editing old interaction: ${err.message}`);
        await createOriginalMessageCacheEntry(interaction);
        return await interaction.editReply(reply);
    }
}

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

    const inventoryButton = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${memberId}:inventoryCommand:extExecute:showUserStatusCommand`)
        .setLabel("Inventário")
        .setStyle(Discord.ButtonStyle.Primary);

    return new Discord.ActionRowBuilder().addComponents(attributesButton, skillsButton, characterButton, inventoryButton);
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

const buildSkillsActionRow = (guildId, userId, selected) => {
    const skillsSelect = new Discord.StringSelectMenuBuilder()
        .setCustomId(`${guildId}:${userId}:showUserStatusCommand:selectSkill`)
        .setPlaceholder("Selecione uma perícia")
        .setOptions(createSelectOptions(Constants.skills, selected));

    const skills = SkillsService.get(userId, guildId) || new Skills(userId, guildId);
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
    const tempAttribute = tempAttributes.get(key);
    if (!tempAttribute) {
        return [false, false, false, false];
    }

    let cancelButtonEnabled = true;
    let decreaseButtonEnabled = true;
    let increaseButtonEnabled = true;
    let confirmButtonEnabled = false;

    const maxAttributeValue = tempAttribute.firstAttributionDone ? Constants.MAX_ATTRIBUTE_VALUE : Constants.MAX_ATTRIBUTE_VALUE_FOR_FIRST_TIME;
    if (tempAttribute[selectedAttribute] >= maxAttributeValue) {
        increaseButtonEnabled = false;
    }

    const minAttributeValue = currentAttributes ? currentAttributes[selectedAttribute] : Constants.MIN_ATTRIBUTE_VALUE;
    if (tempAttribute[selectedAttribute] <= minAttributeValue) {
        decreaseButtonEnabled = false;
    }
    if (tempAttribute.availablePoints < 1) {
        confirmButtonEnabled = true;
        increaseButtonEnabled = false;
    }

    return [ cancelButtonEnabled, decreaseButtonEnabled, increaseButtonEnabled, confirmButtonEnabled ];
}

const buildSelectedSkillActionRows = (guildId, userId, selected) => {
    let actionRows = buildSkillsActionRow(guildId, userId, selected);

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

const changeTempAttributesByAmount = (guildId, memberId, selectedAttribute, amount) => {
    createTempAttributeEntryIfNotExists(guildId, memberId);
    
    const key = guildId + memberId;
    const tempAttribute = tempAttributes.get(key);
    tempAttribute[selectedAttribute] += amount;
    tempAttribute.availablePoints -= amount;
}

const createTempAttributeEntryIfNotExists = (guildId, memberId) => {
    const key = guildId + memberId;
    const currentAttributes = AttributesService.get(guildId, memberId);
    let tempAttribute = tempAttributes.get(key);
    if (tempAttribute) {
        return currentAttributes;
    }
    
    if (currentAttributes.availablePoints < 1) {
        return currentAttributes;
    }

    tempAttribute = tempAttributes.set(key, { currentAttributes });
    tempAttribute.STR = currentAttributes.STR;
    tempAttribute.DEX = currentAttributes.DEX;
    tempAttribute.CON = currentAttributes.CON;
    tempAttribute.WIS = currentAttributes.WIS;
    tempAttribute.CHA = currentAttributes.CHA;
    tempAttribute.availablePoints = currentAttributes.availablePoints;
    tempAttribute.firstAttributionDone = currentAttributes.firstAttributionDone;

    return currentAttributes;
}

const createOriginalMessageCacheEntry = async (interaction) => {
    const key = interaction.guild.id + interaction.member.id;
    const originalInteraction = originalInteractions.get(key);
    if (originalInteraction) {
        try {
            await originalInteraction.deleteReply();
        } catch {
            Logger.warn("Tried to delete non-existing interaction message");
        }
    }

    originalInteractions.set(key, interaction);
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

        if (target.id !== interaction.user.id && !RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("É necessário cargo de ADM para consultar o status de outros usuários.");
            return;
        }

        const tempAttributesKey = guildId + target.id;
        const embed = EmbededResponseService.getUserStatus(guildId, target, tempAttributes.get(tempAttributesKey));
        const actionRow = buildHomeActionRow(guildId, target.id);

        await createOriginalMessageCacheEntry(interaction);
        return await interaction.editReply({
            embeds: [embed],
            components: [actionRow],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });
    },
    showAttributesRow: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
            return;
        }

        const key = guildId + interaction.member.id;
        const actionRows = buildAttributesActionRows(guildId, memberId);
        
        await safeEditReply(interaction, { components: actionRows });
    },
    showCharacterModal: async (interaction, guildId, memberId) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const user = UserService.get(guildId, memberId, false);

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
        await interaction.deferUpdate();

        const user = UserService.get(guildId, memberId, false);
        
        let name = null;
        if (!user.playerName) {
            name = interaction.fields.getTextInputValue("name");
            user.playerName = name;
        }

        const imgUrl = interaction.fields.getTextInputValue("imgUrl");
        const notes = interaction.fields.getTextInputValue("notes");
        const oldImgUrl = user.imgUrl;

        if (isValidUrl(imgUrl)) {
            user.imgUrl = imgUrl;
        }
        user.notes = notes;

        UserService.upsert(user, false);

        const key = guildId + interaction.member.id;
        const updatedEmbed = EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttributes.get(key));

        try {
            await safeEditReply(interaction, { embeds: [updatedEmbed] });
        } catch(err) {
            if (/URL_TYPE_INVALID_URL/.test(err.message)) {
                user.imgUrl = oldImgUrl;
                UserService.upsert(user, false);
                await interaction.editReply({
                    content: `A url ${imgUrl} não é válida!`,
                    ephemeral: true
                });
                return;
            }
        }
    },
    showSkillsRow: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();

        const embed = EmbededResponseService.getUserSkills(guildId, memberId);
        const actionRows = buildSkillsActionRow(guildId, memberId);

        const key = guildId + interaction.member.id;
        await safeEditReply(interaction, {
            embeds: [embed],
            components: actionRows 
        });
    },
    selectAttribute: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
            return;
        }

        const selectedAttribute = interaction.values[0];
        const currentAttributes = createTempAttributeEntryIfNotExists(guildId, memberId);

        let attributeButtonsAvailability = [false, false, false, false];
        if (!currentAttributes || currentAttributes.availablePoints > 0) {
            attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, currentAttributes);
        }
        const actionRows = buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability);
        
        const key = guildId + interaction.member.id;
        await safeEditReply(interaction, { components: actionRows });
    },
    clearTempAttributes: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
            return;
        }

        const key = guildId + interaction.member.id;
        tempAttributes.unset(key);

        const updatedEmbed = EmbededResponseService.getUserStatus(guildId, interaction.member);
        const actionRows = buildAttributesActionRows(guildId, memberId);
        await safeEditReply(interaction, { 
            embeds: [updatedEmbed],
            components: actionRows 
        });
    },
    saveTempAttributes: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();

        const key = guildId + interaction.member.id;
        const tempAttribute = tempAttributes.get(key);
        if (interaction.user.id != memberId || !tempAttribute || tempAttribute.availablePoints > 0) {
            return;
        }

        const user = UserService.get(guildId, memberId, false);
        if (!user.playerName) {
            await interaction.followUp({ 
                content: "Você precisa escolher um nome para seu personagem antes de terminar a ficha!",
                ephemeral: true 
            });
            return;
        }

        const attributes = new Attributes(
            memberId, guildId, 
            tempAttribute.STR, 
            tempAttribute.DEX, 
            tempAttribute.CON, 
            tempAttribute.WIS, 
            tempAttribute.CHA,
            tempAttribute.availablePoints,
            true
        );

        let propagateChangesToStats = true;
        if (!tempAttribute.firstAttributionDone) {
            StatsService.setInitialStats(attributes);
            propagateChangesToStats = false;
            Logger.info(`User ${user.username} (${user.playerName}) finished first attributes pick up`);

            try {
                await interaction.member.setNickname(user.playerName);
            } catch {
                await interaction.followUp({ content: "Não consigo atualizar o seu nickname porque você é o dono do servidor ou tem um cargo maior do que o meu.", ephemeral: true });
            }
        }

        AttributesService.update(attributes, propagateChangesToStats);
        tempAttributes.unset(key);

        const updatedEmbed = EmbededResponseService.getUserStatus(guildId, interaction.member);
        const actionRows = buildAttributesActionRows(guildId, memberId);
        await safeEditReply(interaction, { 
            embeds: [updatedEmbed],
            components: actionRows 
        });
    },
    increaseAttribute: async (interaction, guildId, memberId, selectedAttribute) => {
        await interaction.deferUpdate();
        const key = guildId + interaction.member.id;
        if (interaction.user.id != memberId) {
            return;
        }

        changeTempAttributesByAmount(guildId, memberId, selectedAttribute, 1);
        
        const tempAttribute = tempAttributes.get(key);
        const attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, tempAttribute.currentAttributes);
        await safeEditReply(interaction, { 
            embeds: [ EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttribute) ],
            components: buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability)
        });
    },
    decreaseAttribute: async (interaction, guildId, memberId, selectedAttribute) => {
        await interaction.deferUpdate();
        const key = guildId + interaction.member.id;
        if (interaction.user.id != memberId) {
            return;
        }

        changeTempAttributesByAmount(guildId, memberId, selectedAttribute, -1);

        const tempAttribute = tempAttributes.get(key);
        const attributeButtonsAvailability = getAttributeButtonsAvailability(guildId, memberId, selectedAttribute, tempAttribute.currentAttributes);
        await safeEditReply(interaction, { 
            embeds: [ EmbededResponseService.getUserStatus(guildId, interaction.member, tempAttribute) ],
            components: buildSelectedAttributeActionRows(guildId, memberId, selectedAttribute, attributeButtonsAvailability), 
        });
    },
    selectSkill: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
            return;
        }

        const selectedSkill = interaction.values[0];
        const actionRows = buildSelectedSkillActionRows(guildId, memberId, selectedSkill);

        const key = guildId + interaction.member.id;
        await safeEditReply(interaction, { components: actionRows });
    },
    updateSkill: async (interaction, guildId, memberId, selectedSkill) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
            return;
        }

        const skillValueOptions = interaction.message.components[1].components[0].data.options;
        const newSkillLevel = skillValueOptions.find(opt => opt.default).value;

        SkillsService.updateSingleSkill(memberId, guildId, selectedSkill, newSkillLevel);
        const embed = EmbededResponseService.getUserSkills(guildId, interaction.user);

        const key = guildId + interaction.member.id;
        await safeEditReply(interaction, { embeds: [embed] });
    },
    updateSkillLevel: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();
        if (interaction.user.id != memberId) {
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
        
        await safeEditReply(interaction, { components: interaction.message.components });
    },
    gotoHomeRow: async (interaction, guildId, memberId) => {
        await interaction.deferUpdate();

        const originalInteractionKey = guildId + interaction.member.id;
        const tempAttributesKey = guildId + memberId;
        const tempAttribute = tempAttributes.get(tempAttributesKey);
        const member = await interaction.guild.members.fetch(memberId);
        const embed = EmbededResponseService.getUserStatus(guildId, member, tempAttribute);
        const actionRow = buildHomeActionRow(guildId, memberId);
        
        await safeEditReply(interaction, { 
            embeds: [embed],
            components: [actionRow]
        });
    },
    extGotoHome: async (interaction, guildId, memberId) => {
        await interaction.deferReply({ ephemeral: true });
        const tempAttributesKey = guildId + memberId;
        const tempAttribute = tempAttributes.get(tempAttributesKey);
        const member = await interaction.guild.members.fetch(memberId);
        const embed = EmbededResponseService.getUserStatus(guildId, member, tempAttribute);
        const actionRow = buildHomeActionRow(guildId, memberId);
        
        await createOriginalMessageCacheEntry(interaction);
        const message = await interaction.editReply({ 
            embeds: [embed],
            components: [actionRow],
            ephemeral: true
        });

        eventEmitter.emit("showUserStatusCommand_extGotoHome", guildId, interaction.member.id);

        return message;
    }
}

// events
eventEmitter.on("inventoryCommand_extExecute", async (guildId, userId) => {
    const key = guildId + userId;
    try {
        await originalInteractions.get(key)?.deleteReply();
    } catch {
        return;
    }
});