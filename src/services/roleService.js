const roleDAO = require("../DAOs/roleDAO");
const Role = require("../models/role");

class RoleService {
    static async getAllRoles() {
        return await roleDAO.getAll();
    }

    static async getRole(guildId, type) {
        return await roleDAO.get(guildId, type);
    }

    static async isMemberAdm(guild, discordMember) {
        if (guild.ownerId === discordMember.user.id) {
            return true;
        }

        const admRole = await this.getRole(guild.id, Role.ADM_TYPE);

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
