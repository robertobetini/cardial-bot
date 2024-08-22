const Discord = require("discord.js");

const UserService = require("../../services/userService");
const RoleService = require("../../services/roleService");
const InventoryService = require("../../services/inventoryService");

const User = require("../../models/user");

const { dropPlayerItems } = require("../../commands/combat/getDropsCommand");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("matar")
        .setDescription("Remove usuário por completo (status, atributos, itens, perícias, etc.)")
        .addUserOption(option =>
			option
				.setName("user")
                .setDescription("Jogador")
				.setRequired(true)
        )
        .addUserOption(option =>
			option
				.setName("assassino")
                .setDescription("Assassino do jogador, caso tenha sido mortor outro jogador (dropa todos os itens)")
				.setRequired(false)
        ),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const target = interaction.options.getUser("user");
        const killer = interaction.options.getUser("assassino");
        const guildId = interaction.guild.id;

        if (target.id === killer?.id) {
            await interaction.editReply("...?");
            return;
        }

        const targetUser = UserService.get(guildId, target.id, true);
        if (!targetUser?.attributes?.firstAttributionDone) {
            throw new Error("Apenas jogadores com ficha completa podem morrer!");
        }

        if (killer) {
            const killerUser = UserService.get(guildId, killer.id, true);
            if (!killerUser?.attributes?.firstAttributionDone) {
                throw new Error("Assassino possui ficha incompleta!");
            }

            await dropPlayerItems(interaction, targetUser, killerUser);
        }

        const user = new User(target.id, guildId, target.username, target.displayAvatarURL());
        UserService.upsert(user, true);
        InventoryService.clear(target.id, guildId);
        
        const member = await interaction.guild.members.fetch(target.id);
        try {
            await member.setNickname(user.playerName);
        } catch { }

        await interaction.editReply({
            content: `Jogador ${Discord.userMention(target.id)} foi d&scon&#t@dº...`,
            files: [ { attachment: "assets/death.gif" } ]
        });
    }
};
