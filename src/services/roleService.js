const roleDAO = require("../DAOs/roleDAO");

class RoleService {
    static async isMemberAdm(guild, discordMember) {
        if (guild.ownerId === discordMember.user.id) {
            return true;
        }

        const admRole = await roleDAO.get(guild.id, Role.ADM_TYPE);

        if (!admRole) {
            throw new Error("O cargo de ADM ainda não foi definido, o dono do servidor deve defini-lo através do comando `/cargoadm`.");
        }

        if (discordMember.roles.cache.has(admRole.roleId)) {
            return true;
        }

        return false;
    }

    static async upsert(admRole) {
        await roleDAO.upsert(admRole);
    }
}

module.exports = RoleService;
