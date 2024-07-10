const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const MonsterService = require("../../services/monsterService");
const MonsterDropsService = require("../../services/monsterDropsService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");

const { addMultipleUserOptions, addMultipleAutocompletes, getUsersFromInput, getStringsFromInput } = require ("../helpers");
const { randomId } = require("../../utils");
const InventoryService = require("../../services/inventoryService");
const Logger = require("../../logger");
const AUTOCOMPLETE_OPTION_BASE_NAME = "mob";

const data = new Discord.SlashCommandBuilder()
    .setName("drop")
    .setDescription("Gera uma lista de drops a partir dos mobs escolhidos");

addMultipleAutocompletes(data, AUTOCOMPLETE_OPTION_BASE_NAME, Constants.COMMAND_MAX_MOBS, 1);
addMultipleUserOptions(data, Constants.COMMAND_MAX_USERS, 0);

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

        const targets = getUsersFromInput(interaction, Constants.COMMAND_MAX_USERS).users;

        const embed = EmbededResponseService.getLootView(dropDetails);
        const message = await interaction.editReply({
            embeds: [embed],
            files: [EmbededResponseService.FOOTER_IMAGE]
        });

        const poll = {
            allowMultiselect: true,
            layoutType: Discord.PollLayoutType.Default,
            question: { text: "Selecione os itens que deseja" },
            duration: 2,
            answers: Object.keys(dropSummary).map(itemName => ({ text: `${itemName} [x${dropSummary[itemName]}]` }))
        };

        if (poll.answers.length < 1 || targets.length < 1) {
            return;
        }

        const pollId = randomId(10);
        transients[pollId] = { 
            users: targets.map(t => ({ key: interaction.guild.id + t.userId, confirmed: false })),
            originalMessage: message,
            dropSummary
        };
        const threadChannel = await message.startThread({ name: "drops" });
        await threadChannel.send({ 
            content: `drop-${pollId}`,
            poll 
        });
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
        if (!transients[pollId]) {
            return;
        }

        // confirm if isVoteRemove == false, unconfirm if isVoteRemove == true
        const guildId = pollAnswer.poll.message.guildId;
        const voterKeys = (await pollAnswer.fetchVoters()).map(v => guildId + v.id);
        for (const user of transients[pollId].users) {
            if (voterKeys.includes(user.key)) {
                user.confirmed = !isVoteRemove;
            }
        }

        console.log(transients[pollId].users);
        // check if all users are confirmed
        for (const user of transients[pollId].users) {
            if (!user.confirmed) {
                return;
            }
        }

        try {
            await pollAnswer.poll.end();
        } catch {
            Logger.warn("Tried to end an expired poll, skippint item distribution because it was already done");
            return;
        }

        // distribute items
        for (const answer of pollAnswer.poll.answers) {
            const answerData = answer[1];
            const voterIds = (await answerData.fetchVoters()).map(v => v.id);
            Logger.info(`Distributing items ${answerData.text} between users: ${voterIds}`);
            InventoryService.distributeLootEvenly(answerData.text, voterIds, guildId);
        }

        // update loot message and delete transient and thread
        await pollAnswer.poll.message.channel.delete();
        const embed = transients[pollId].originalMessage.embeds[0];
        embed.data.title += " (Concluído)";
        await transients[pollId].originalMessage.edit({ embeds: [embed], attachments: [], files: [] });
        delete transients[pollId];
    }
}
