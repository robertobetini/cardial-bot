const Discord = require("discord.js");
const RoleService = require("../../services/roleService");
const Role = require("../../models/role");
const Logger = require("../../logger");

const choices = [
    { name: "ADM", value: Role.ADM_TYPE },
    { name: "GM", value: Role.GM_TYPE },
    { name: "GM de Combate", value: Role.BATTLE_GM_TYPE },
    { name: "Moderador", value: Role.MODERATOR_TYPE },
    { name: "Jogador", value: Role.PLAYER_TYPE },
    { name: "Jogador Desperto", value: Role.ENLIGHTENED_PLAYER_TYPE },
    { name: "Jogador Temporário", value: Role.TEMP_PLAYER_TYPE },
    { name: "Ficha Incompleta", value: Role.UNFINISHED_SHEET_TYPE },
    { name: "Usuário", value: Role.USER_TYPE },
    { name: "Booster 1", value: Role.BOOSTER1_TYPE },
    { name: "Booster 2", value: Role.BOOSTER2_TYPE }
];

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("cargo")
        .setDescription("Define cargos essenciais do sistema")
        .addStringOption(option =>
            option
                .setName("função")
                .setDescription("Função a configurar o cargo")
                .addChoices(choices)
                .setRequired(true)
        )
        .addRoleOption(option =>
			option
				.setName("cargo")
				.setDescription("O cargo do servidor que será considerado pelo bot para a determinada função")
				.setRequired(true)),
    execute: async (interaction) => {
        const roleType = interaction.options.getString("função");
        const role = interaction.options.getRole("cargo");

        if (interaction.user.id !== interaction.guild.ownerId) {
            await interaction.editReply("Apenas o dono do servidor pode alterar os cargos do sistema.");
            return;
        }
        
        const admRole = new Role(interaction.guild.id, role.id, roleType);
        RoleService.upsert(admRole);
        Logger.warn(`Role ${roleType} updated by ${interaction.user.username} [guildId: ${interaction.guild.id}, userId: ${interaction.user.id}]`);
        await interaction.editReply(`Cargo de **${choices.find(c => c.value === roleType)?.name}** alterado com sucesso.`);
    }
}
