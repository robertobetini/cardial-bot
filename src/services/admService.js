const admRoleDAO = require("./../DAOs/admRoleDAO");

class AdmService {
    static async isMemberAdm(guild, discordMember) {
        console.log(discordMember);
        if (guild.ownerId === discordMember.user.id) {
            return true;
        }

        const admRole = await admRoleDAO.get(guild.id);

        if (!admRole) {
            throw new Error("O cargo de ADM ainda não foi definido, o dono do servidor deve defini-lo através do comando `/cargoadm`.");
        }

        if (discordMember.roles.cache.has(admRole.roleId)) {
            return true;
        }

        return false;
    }
}

module.exports = AdmService;
