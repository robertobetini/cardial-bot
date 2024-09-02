const Discord = require("discord.js");

const RoleService = require("../../services/roleService");
const UserService = require("../../services/userService");
const StatsService = require("../../services/statsService");

const Constants = require("../../constants");
const Logger = require("../../logger");

const forceUpdateNicknames = async (interaction) => {
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
        } catch (err) { 
            Logger.warn(`Couldn't update nickname for player ${user.playerName}: ${err.message}`);
            continue;
        }
    }

    await interaction.editReply(`Nicknames de ${count} jogador${ count > 1 ? "es" : "" } atualizados.`);
}

const updateStats = async (interaction) => {
    const target = interaction.options.getUser("user");
    const guildId = interaction.guild.id;

    const user = UserService.get(guildId, target.id, true);
    if (!user) {
        await interaction.editReply("O jogador não possui ficha ainda!");
        return;
    }

    const stat = interaction.options.getString("status");
    const value = interaction.options.getInteger("valor");

    user.stats.modifyStat(stat, value);

    StatsService.update(user.stats);

    await interaction.editReply("Status atualizado com sucesso!");
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("atualiza")
        .setDescription("Atualiza detalhes da ficha de usuário")
        .addSubcommand(subcommand => 
            subcommand
                .setName("status")
                .setDescription("Atualiza HP, FP e SP atuais e temporários")
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
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName("status2")
                .setDescription("Atualiza HP, FP e SP máximos, CA e Slots extras")
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
                            Constants.sensibleStats.map(({ label, value }) => ({ name: label, value }))
                        )
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("valor")
                        .setDescription("Valor a ser adicionado ou removido, caso o sinal seja negativo")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("nickname")
                .setDescription("Força atualização de nicknames")
        ),
    execute: async (interaction) => {
        const subcommand = interaction.options._subcommand;

        switch (subcommand) {
            case "status":
                // change validation here as soon as there are battle GMs
                RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
                await updateStats(interaction);
                break;
            case "status2":
                RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
                await updateStats(interaction);
                break;
            case "nickname":
                RoleService.ensureMemberIsAdmOrOwner(interaction.guild, interaction.member);
                await forceUpdateNicknames(interaction);
                break;
            default:
                await interaction.editReply(`Sub-comando ${subcommand} não encontrado!`);
                break;
        }
    }
};
