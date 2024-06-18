const Discord = require("discord.js");
const userDAO = require("../../DAOs/userDAO");
const RoleService = require("../../services/roleService");
const User = require("../../models/user");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("matar")
        .setDescription("Remove usuário por completo (status, atributos, itens, perícias, etc.)")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser("user");

        const guildId = interaction.guild.id;

        if (!await RoleService.isMemberAdm(interaction.guild, interaction.member)) {
            await interaction.editReply("É necessário cargo de ADM para remover um personagem.");
        }

        const user = new User(target.id, guildId, target.username, target.displayAvatarURL());
        await userDAO.update(user, true);

        await interaction.editReply({
            content: `Jogador ${Discord.userMention(target.id)} foi d&scon&#t@dº...`,
            files: [ { attachment: "assets/death.gif" } ]
        });
    },
};
