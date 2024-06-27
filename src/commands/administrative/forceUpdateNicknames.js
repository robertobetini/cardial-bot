const Discord = require("discord.js");

const UserService = require("../../services/userService");
const RoleService = require("../../services/roleService");

const Logger = require("../../logger");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("atualizanickname")
        .setDescription("Força atualização de nicknames"),
    async execute(interaction) {
        RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
        
        const users = UserService.getAllFromGuild(interaction.guild.id);

        let count = 0;
        for (const user of users) {
            try {
                if (!user.attributes.firstAttributionDone || !user.playerName) {
                    continue;
                }

                const member = await interaction.guild.members.fetch(user.userId);
                await member.setNickname(user.playerName);
                count++;
            } catch { 
                Logger.warn(`Couldn't update nickname for player ${user.playerName}`);
                continue;
            }
        }

        await interaction.editReply(`Nicknames de ${count} jogador${ count > 1 ? "es" : "" } atualizados.`);
    }
};
