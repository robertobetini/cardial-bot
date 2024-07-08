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
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const target = interaction.options.getUser("user");
        const guildId = interaction.guild.id;

        const user = new User(target.id, guildId, target.username, target.displayAvatarURL());
        const member = await interaction.guild.members.fetch(target.id);
        userDAO.upsert(user, true);

        try {
            await member.setNickname(user.playerName);
        } catch { }

        await interaction.editReply({
            content: `Jogador ${Discord.userMention(target.id)} foi d&scon&#t@dº...`,
            files: [ { attachment: "assets/death.gif" } ]
        });
    }
};
