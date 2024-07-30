const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterService = require("../../services/monsterService");
const MonsterDropsService = require("../../services/monsterDropsService");
const EmbededResponseService = require("../../services/embededResponseService");
const InventoryService = require("../../services/inventoryService");
const ProgressionService = require("../../services/progressionService");
const UserService = require("../../services/userService");

const Constants = require("../../constants");

const { addMultipleUserOptions, addMultipleAutocompletes, getUsersFromInput, getStringsFromInput } = require ("../helpers");
const { randomId } = require("../../utils");

const Logger = require("../../logger");
const StatsService = require("../../services/statsService");

const AUTOCOMPLETE_OPTION_BASE_NAME = "mob";

const data = new Discord.SlashCommandBuilder()
    .setName("drop")
    .setDescription("Gera uma lista de drops a partir dos mobs escolhidos");

addMultipleAutocompletes(data, AUTOCOMPLETE_OPTION_BASE_NAME, Constants.COMMAND_MAX_MOBS, 1);
addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 0);

const NOT_APPLICABLE_TOKEN = "N/A";
const POLL_DURATION_IN_HOURS = 2;
const CACHE_LIFETIME = POLL_DURATION_IN_HOURS * Constants.HOUR_IN_MILLIS;
const transients = {};

module.exports = {
    data,
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const monsterIds = getStringsFromInput(interaction, AUTOCOMPLETE_OPTION_BASE_NAME, Constants.COMMAND_MAX_MOBS)
            .data
            .filter(d => d);
        const monsters = monsterIds.map(monsterId => MonsterService.get(monsterId, true));
        const [dropDetails, dropSummary] = MonsterDropsService.generateDrops(monsters);
        console.log(dropSummary);
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

        const embed = EmbededResponseService.getLootView(dropDetails, targets);
        const message = await interaction.editReply({
            embeds: [embed],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });

        const distinctItems = Object.keys(dropSummary);
        if (distinctItems.length < 1 || targets.length < 1) {
            return;
        }

        // poll creation handling
        const pollNum = Math.ceil(distinctItems.length / Constants.ITEMS_PER_POLL);
        const pollItems = distinctItems.map(itemName => ({ text: `${itemName} [x${dropSummary[itemName]}]` }));
        const threadChannel = await message.startThread({ name: "drops" });
        transients[threadChannel.id] = [];
        const promises = [];
        for(let i = 0; i < pollNum; i++) {
            const poll = {
                allowMultiselect: true,
                layoutType: Discord.PollLayoutType.Default,
                question: { text: "Selecione os itens que deseja" },
                duration: POLL_DURATION_IN_HOURS,
                answers: pollItems
                    .slice(Constants.ITEMS_PER_POLL * i, Constants.ITEMS_PER_POLL * (i + 1))
                    .concat({ text: NOT_APPLICABLE_TOKEN })
            };
    
            const pollId = randomId(10);
            const promise = threadChannel.send({ 
                content: `drop-${pollId}`,
                poll 
            });
            promises.push(promise);
    
            transients[threadChannel.id].push({
                pollId,
                users: targets.map(t => ({ key: interaction.guild.id + t.userId, confirmed: false })),
                originalMessage: message,
                threadChannel
            });
            setTimeout(() => delete transients[threadChannel.id][pollId], CACHE_LIFETIME);
        }

        await Promise.all(promises);
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
        const threadChannel = pollAnswer.poll.message.channel;
        if (!transients[threadChannel.id]) {
            return;
        }
        const transientIndex = transients[threadChannel.id].findIndex(p => p.pollId === pollId);
        if (transientIndex < 0) {
            return;
        }
        const transient = transients[threadChannel.id][transientIndex];

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

        // update loot message and delete transient and thread if there are no items remaining
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
            transients[threadChannel.id].push({ 
                pollId: newPollId,
                users: transient.users.map(u => ({ key: u.key, confirmed: false })),
                originalMessage: transient.originalMessage,
                threadChannel: transient.threadChannel
            });
            await transient.threadChannel.send("Um ou mais usuários estão sem slots disponíveis para receber os itens escolhidos... Uma nova enquete será feita.");
            await transient.threadChannel.send({ 
                content: `drop-${newPollId}`,
                poll 
            });

            delete transients[threadChannel.id][pollId];
            setTimeout(() => delete transients[newPollId], CACHE_LIFETIME);
            return;
        }

        transients[threadChannel.id].splice(transientIndex, 1);
        if (transients[threadChannel.id].length > 0) {
            return;
        }

        const embed = transient.originalMessage.embeds[0];
        embed.data.author.name += " (Concluído)";

        await Promise.all([
            threadChannel.delete(),
            transient.originalMessage.edit({ embeds: [embed], attachments: [], files: [] })
        ]);

        delete transients[threadChannel.id];
    }
}
