const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterService = require("../../services/monsterService");
const DropsService = require("../../services/dropsService");
const EmbededResponseService = require("../../services/embededResponseService");
const InventoryService = require("../../services/inventoryService");
const ProgressionService = require("../../services/progressionService");
const UserService = require("../../services/userService");

const Constants = require("../../constants");
const Cache = require("../../cache");
const Logger = require("../../logger");

const { addMultipleUserOptions, addMultipleAutocompletes, getUsersFromInput, getStringsFromInput } = require ("../helpers");
const { randomId } = require("../../utils");

const AUTOCOMPLETE_OPTION_BASE_NAME = "mob";
const NOT_APPLICABLE_TOKEN = "N/A";
const CACHE_LIFETIME = Constants.POLL_DURATION_IN_HOURS * Constants.HOUR_IN_MILLIS;
const POLL_IDENTIFIER = "drop";
const transients_cache = new Cache("DROPS_CACHE", CACHE_LIFETIME);

const drop = async (interaction, monsterIds) => {
    RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
    
    Logger.info(`Fetching monsters with ids: ${monsterIds}`);
    const monsters = monsterIds.map(monsterId => MonsterService.get(monsterId, true));
    const [dropDetails, dropSummary] = DropsService.generateMonsterDrops(monsters);
    const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS).users;

    // Exp distribution
    for (const user of targets) {
        user.totalMobExp = monsters
            .filter(m => user.stats.lvl - m.level < Constants.NO_EXP_LEVEL_GAP)
            .reduce((prev, current) => prev += current.baseExp, 0);
        user.totalMobBaseGold = monsters.reduce((prev, current) => prev += current.baseGold, 0);
        user.stats.gold += user.totalMobBaseGold;
        ProgressionService.addExpAndMastery(user, user.totalMobExp);
    }
    UserService.batchUpsert(targets, true);

    const embed = EmbededResponseService.getLootView(dropDetails, targets, monsters);
    const message = await interaction.editReply({
        embeds: [embed],
        files: [EmbededResponseService.FOOTER_IMAGE]
    });

    const distinctItems = Object.keys(dropSummary);
    if (distinctItems.length < 1 || targets.length < 1) {
        return;
    }

    const pollItems = distinctItems.map(itemName => ({ text: `${itemName} [x${dropSummary[itemName]}]` }));

    await createPollInChannelDirectly(interaction, message, pollItems, targets);
}

const dropPlayerItems = async (interaction, user, killer) => {
    RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
    
    Logger.info(`Droping player ${user.displayName} items`);
    const dropSummary = DropsService.dropPlayerItems(user);
    const embed = EmbededResponseService.getPlayerLootView(dropSummary, user);
    const message = await interaction.editReply({
        embeds: [embed],
        files: [EmbededResponseService.FOOTER_IMAGE]
    });

    const distinctItems = Object.keys(dropSummary);
    if (distinctItems.length < 1 || !killer) {
        return;
    }

    const pollItems = distinctItems.map(itemId => ({ text: `${dropSummary[itemId]?.name} [x${dropSummary[itemId]?.count}]` }));
    await createPollInChannelDirectly(interaction, message, pollItems, [killer]);
}

const createPollInChannelDirectly = async (interaction, originalMessage, pollItems, targets) => {
    const pollNum = Math.ceil(pollItems.length / Constants.ITEMS_PER_POLL);
    const executionId = randomId(10);
    const transients = transients_cache.set(executionId, [], async transients => {
        for (const transient of transients) {
            for (const pollItem of transient.pollItems) {
                InventoryService.distributeLootEvenly(pollItem, transient.users.map(user => user.userId), transient.pollMessage.guildId);
            }
            await transient.pollMessage.delete();
        }
        
        const transient = transients[0];
        const embed = transient.originalMessage.embeds[0];
        embed.data.author.name += " (Concluído)";
        await transient.originalMessage.edit({ embeds: [embed], attachments: [], files: [] });
    });

    for(let i = 0; i < pollNum; i++) {
        const significantAnswers = pollItems.slice(Constants.ITEMS_PER_POLL * i, Constants.ITEMS_PER_POLL * (i + 1));
        const poll = {
            allowMultiselect: true,
            layoutType: Discord.PollLayoutType.Default,
            question: { text: "Selecione os itens que deseja" },
            duration: Constants.POLL_DURATION_IN_HOURS,
            answers: significantAnswers.concat({ text: NOT_APPLICABLE_TOKEN })
        };

        const pollId = randomId(10);
        const pollMessage = await interaction.channel.send({ 
            content: `${POLL_IDENTIFIER}-${executionId}-${pollId}`,
            poll 
        });

        transients.push({
            pollId,
            users: targets.map(t => ({ userId: t.userId, key: interaction.guild.id + t.userId, confirmed: false })),
            originalMessage,
            pollMessage,
            pollItems: significantAnswers.map(answer => answer.text)
        });
    }
}

const computeVote = async (pollAnswer, executionId, pollId, isVoteRemove) => {
    const transients = transients_cache.get(executionId);
    if (!transients) {
        return;
    }

    const transientIndex = transients.findIndex(p => p.pollId === pollId);
    if (transientIndex < 0) {
        return;
    }
    const transient = transients[transientIndex];

    // confirm if isVoteRemove == false, unconfirm if isVoteRemove == true
    const guildId = pollAnswer.poll.message.guildId;
    const voterKeys = (await pollAnswer.fetchVoters()).map(v => guildId + v.id);
    for (const user of transient.users) {
        if (voterKeys.includes(user.key)) {
            user.confirmed = !isVoteRemove;
        }
    }

    // check if all users are confirmed
    for (const user of transient.users) {
        if (!user.confirmed) {
            return;
        }
    }

    try {
        await pollAnswer.poll.end();
    } catch {
        Logger.warn("Tried to end an expired poll, skipping item distribution because it was already done");
        return;
    }

    // distribute items
    const notDistributedItems = [];
    for (const answer of pollAnswer.poll.answers) {
        const answerData = answer[1];
        const pollItemText = answerData.text;
        if (pollItemText === NOT_APPLICABLE_TOKEN) {
            continue;
        }

        const voterIds = (await answerData.fetchVoters()).map(v => v.id);
        if (voterIds.length < 1) {
            continue;
        }
        Logger.info(`Distributing items ${pollItemText} between users: ${voterIds}`);
        
        const remainingItem = InventoryService.distributeLootEvenly(pollItemText, voterIds, guildId);
        if (remainingItem) {
            notDistributedItems.push(remainingItem);
        }
    }

    // update loot message and delete transient and polls if there are no items remaining
    if (notDistributedItems.length > 0) {
        const poll = {
            allowMultiselect: true,
            layoutType: Discord.PollLayoutType.Default,
            question: { text: "Selecione os itens que deseja" },
            duration: 2,
            answers: notDistributedItems
                .map(item => ({ text: item }))
                .concat({ text: NOT_APPLICABLE_TOKEN })
        };

        const newPollId = randomId(10);
        await transient.originalMessage.channel.send("Um ou mais usuários estão sem slots disponíveis para receber os itens escolhidos... Uma nova enquete será feita.");
        const pollMessage = await transient.originalMessage.channel.send({ 
            content: `${POLL_IDENTIFIER}-${executionId}-${newPollId}`,
            poll
        });
        transients.push({ 
            pollId: newPollId,
            users: transient.users.map(u => ({ key: u.key, confirmed: false })),
            originalMessage: transient.originalMessage,
            pollMessage
        });

        transients_cache.set(executionId, transients);
    }
    
    await transient.pollMessage.delete();
    transients.splice(transientIndex, 1);
    if (transients.length > 0) {
        return;
    }

    const embed = transient.originalMessage.embeds[0];
    embed.data.author.name += " (Concluído)";

    await transient.originalMessage.edit({ embeds: [embed], attachments: [], files: [] });

    transients_cache.unset(executionId);
}

const data = new Discord.SlashCommandBuilder()
    .setName("drop")
    .setDescription("Gera uma lista de drops a partir dos mobs escolhidos");

addMultipleAutocompletes(data, AUTOCOMPLETE_OPTION_BASE_NAME, Constants.COMMAND_MAX_MOBS, 1);
addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 0);

module.exports = {
    data,
    async execute(interaction) {
        const monsterIds = getStringsFromInput(interaction, AUTOCOMPLETE_OPTION_BASE_NAME, Constants.COMMAND_MAX_MOBS)
            .data
            .filter(d => d);

        await drop(interaction, monsterIds);
    },
    autocomplete: async (interaction) => {
        const queryName = interaction.options.getFocused();
        if (!queryName) {
            return;
        }
        
        const choices = MonsterService.like(queryName, 25);
        await interaction.respond(
            choices.map(c => ({ name: `${c.name}`, value: c.id }))
        );
    },
    pollHandler: async (pollAnswer, pollId, isVoteRemove) => {
        await computeVote(pollAnswer, pollId, isVoteRemove);
    },
    drop,
    dropPlayerItems,
    computeVote
}
