const roleDAO = require("../DAOs/roleDAO");
const Role = require("../models/role");
const { SilentError } = require("../errors/silentError");

class RoleService {
    static getAllRoles() {
        return roleDAO.getAll();
    }

    static getRole(guildId, type) {
        return roleDAO.get(guildId, type);
    }

    static ensureMemberIsAdmOrOwner(guild, discordMemder) { 
        if (!RoleService.isMemberAdm(guild, discordMemder)) {
            throw new SilentError("Você não é GM, parça...");
        }
    }

    static isMemberAdm(guild, discordMember) {
        if (guild.ownerId === discordMember.user.id) {
            return true;
        }

        const admRole = this.getRole(guild.id, Role.ADM_TYPE);

        if (!admRole) {
            throw new Error("O cargo de ADM ainda não foi definido, o dono do servidor deve defini-lo através do comando `/cargoadm`.");
        }

        if (discordMember.roles.cache.has(admRole.roleId)) {
            return true;
        }

        return false;
    }

    static upsert(admRole) {
        roleDAO.upsert(admRole);
    }
}

module.exports = RoleService;
