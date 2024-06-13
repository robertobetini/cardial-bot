const RoleService = require("../services/roleService");
const userDAO = require("../DAOs/userDAO");
const Role = require("../models/role");
const Logger = require("../logger");

module.exports = {
    execute: async () => {
        Logger.info("Running update silent roles routine.");

        const [roles, users] = await Promise.all([
            RoleService.getAllRoles(),
            userDAO.getAllSilent()
        ]);

        for (let user of users) {
            const now = new Date().getTime();
            if (user.silenceEndTime && now > user.silenceEndTime) {
                const role = roles.find(role => role.type === Role.SILENT_TYPE && role.guildId === user.guildId);
                const updateRoleEndpoint = Discord.Routes.guildMemberRole(user.guildId, user.userId, role.roleId);
                const rest = new Discord.REST().setToken(process.env.TOKEN);
                const _data = await rest.delete(updateRoleEndpoint);
                user.silenceEndTime = null;
                await userDAO.update(user);
            }
        }
    }
}