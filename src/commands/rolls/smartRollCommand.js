const Discord = require("discord.js");

const UserService = require("../../services/userService");
const EmbededResponseService = require("../../services/embededResponseService");

const Constants = require("../../constants");
const Logger = require("../../logger");
const { calculateChallengeMod } = require("../../calculators/challengeModCalculator");

const buildRerollActionRow = (guildId, userId, challenge, rerollsSoFar) => {
    const button = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:smartRollCommand:reroll:${challenge}:${++rerollsSoFar}`)
        .setLabel("Rolar novamente")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(button);
}

const roll = (guildId, userId, challenge, rerollsSoFar) => {
    const user = UserService.get(guildId, userId, true);
    if (!user || !user.attributes.firstAttributionDone) {
        return { content: "Você precisa terminar sua ficha antes de executar os testes!", ephemeral: true };
    }

    const dice = 20;
    const totalMod = calculateChallengeMod(challenge, user);
    const roll = Math.floor(Math.random() * dice + 1);

    Logger.debug(`Executing '${challenge}' test for ${user.username} (result: ${roll + totalMod}, rerolls: ${rerollsSoFar})`);
    const embed = EmbededResponseService.getSmartRollView(challenge, "1d20", roll, [totalMod], rerollsSoFar);
    const actionRow = buildRerollActionRow(guildId, userId, challenge, rerollsSoFar);

    return { content: "", embeds: [embed], components: [actionRow] };
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("di")
        .setDescription("Executa um rolagem considerando modificadores")
        .addStringOption(option =>
			option
				.setName("rolagem")
				.setDescription("teste cuja rolagem será feita")
                .setRequired(true)
                .addChoices(
                    Constants.challenges.map(({ label, value }) => ({ name: label, value }))
                )
        ),
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const challenge = interaction.options.getString("rolagem");

        const response = roll(guildId, userId, challenge, 0);
        await interaction.editReply(response);
    },
    reroll: async (interaction, guildId, memberId, challenge, rerollsSoFar) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const response = roll(guildId, memberId, challenge, rerollsSoFar);
        await interaction.reply(response);
    }
}
