const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("placarnivel")
        .setDescription("Mostra o placar atual de níveis dos usuários"),
    async execute(interaction) {
        let users = await userDAO.getAll(interaction.guild.id, "totalExp");

        let message = "```";
        for (let user of users) {
            message += `${user.username} ${user.lvl} ${user.exp}\n`;
        }
        message += "```";

        await interaction.reply(message);
    }
}
