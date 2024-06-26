const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const UserService = require("../../services/userService");
const StatsService = require("../../services/statsService");

const Constants = require("../../constants");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("atualizastatus")
        .setDescription("Remove usuário por completo (status, atributos, itens, perícias, etc.)")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Usuário")
				.setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName("status")
                .setDescription("Status a ser modificado")
                .setChoices(
                    Constants.stats.map(({ label, value }) => ({ name: label, value }))
                )
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("valor")
                .setDescription("Valor a ser adicionado ou removido, caso o sinal seja negativo")
                .setRequired(true)
        ),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);

        const target = interaction.options.getUser("user");
        const guildId = interaction.guild.id;

        const user = UserService.get(guildId, target.id, true);
        if (!user) {
            await interaction.editReply({ content: "O jogador não possui ficha ainda!" });
            return;
        }

        const stat = interaction.options.getString("status");
        const value = interaction.options.getInteger("valor");

        user.stats.modifyStat(stat, value);

        StatsService.update(user.stats);

        await interaction.editReply({ content: "Status atualizado com sucesso!" });
    },
};
