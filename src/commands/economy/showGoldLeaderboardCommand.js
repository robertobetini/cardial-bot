const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placargold")
        .setDescription("Mostra o placar atual de GOLD dos usuários"),
    async execute(interaction) {
        let users = await userDAO.getAll(interaction.guild.id, "gold");

        let message = "```";
        for (let user of users) {
            message += `${user.username} $${user.gold}\n`;
        }
        message += "```";

        await interaction.reply(message);
    }
}

