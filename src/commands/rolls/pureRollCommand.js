const Discord = require("discord.js");

const EmbededResponseService = require("../../services/embededResponseService");

const buildRerollActionRow = (guildId, userId, dice, quantity, rerollsSoFar) => {
    const button = new Discord.ButtonBuilder()
        .setCustomId(`${guildId}:${userId}:pureRollCommand:reroll:${dice}:${quantity}:${++rerollsSoFar}`)
        .setLabel("Rolar novamente")
        .setStyle(Discord.ButtonStyle.Secondary);

    return new Discord.ActionRowBuilder().addComponents(button);
}

const roll = (guildId, userId, dice, quantity, rerollsSoFar = 0) => {
    const results = [];
    for (let i = 0; i < quantity; i++) {
        const result = Math.floor(Math.random() * dice + 1);
        results.push(result);
    }
    const embed = EmbededResponseService.getRollView(dice, results, rerollsSoFar);
    const actionRow = buildRerollActionRow(guildId, userId, dice, quantity, rerollsSoFar);

    return { content: "", embeds: [embed], components: [actionRow] }
};

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("d")
        .setDescription("Executa uma rolagem de dado sem modificadores")
        .addIntegerOption(option =>
			option
				.setName("dado")
				.setDescription("número de lados do lado")
                .setRequired(true)
                .addChoices(
                    { name: 'd4',   value: 4   },
                    { name: 'd6',   value: 6   },
                    { name: 'd8',   value: 8   },
                    { name: 'd10',  value: 10  },
                    { name: 'd12',  value: 12  },
                    { name: 'd20',  value: 20  },
                    { name: 'd100', value: 100 }
                )
        )
        .addIntegerOption(option =>
            option
                .setName("quantidade")
                .setDescription("quantidade de dados para rolar")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)
        ),
    execute: async (interaction) => {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const dice = interaction.options.getInteger("dado");
        const quantity = interaction.options.getInteger("quantidade") ?? 1;

        const response = roll(guildId, userId, dice, quantity);
        await interaction.editReply(response);
    },
    reroll: async (interaction, guildId, memberId, dice, quantity, rerollsSoFar) => {
        if (interaction.user.id != memberId) {
            await interaction.deferUpdate();
            return;
        }

        const response = roll(guildId, memberId, dice, quantity, rerollsSoFar);
        await interaction.reply(response);
    }
}
