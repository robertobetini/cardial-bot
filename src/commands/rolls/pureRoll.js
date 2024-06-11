const Discord = require("discord.js");

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
                )),
    async execute(interaction) {
        try {
            if (interaction.user.id !== interaction.guild.ownerId) {
                await interaction.editReply("Apenas o dono do servidor pode definir o canal padrão.");
            }

            const dice = interaction.options.getInteger("dado");
            const result = Math.floor(Math.random() * dice + 1);
            await interaction.editReply(`1d${dice}: ${result}`);
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}
