const Discord = require("discord.js");
const userDAO = require("./../../DAOs/userDAO");
const User = require("../../models/user");
const expCalculator = require("../../expCalculator");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("nivel")
        .setDescription("Mostra o nível do usuário selecionado")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser("user");

        let user = await userDAO.get(target.id, interaction.guild.id);

        if (!user) {
            user = new User(
                target.id,
                interaction.guild.id,
                target.username
            );

            await userDAO.upsert(user);
        }
        
        const expBarSize = 16;
        const maxLvlExp = expCalculator.getLevelExp(user.lvl)
        const progression = Math.round(user.exp / maxLvlExp * expBarSize);

        let expBar = ""

        for (let i = 1; i <= expBarSize; i++) {
            expBar += progression >= i ? "/" : "-";
        }

        let message = "```r\n"+
        `User: ${user.username}\n` +
        `Level: ${user.lvl}\n` +
        `EXP: ${user.exp}/${maxLvlExp} [${expBar}]\n` +
        "```";

        await interaction.reply(message);
    }
}
